var async = require('async'),
	path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	mysql = require('mysql');

var TYPE = require('../../appc').TYPE;

module.exports = {
	name: 'MySQL Database',
	type: TYPE,
	generator: true,
	execute: generate,

	// fields are inquirer.js "questions". There's a bit more
	// functionality, but it's not mandatory. I'll doc soon.
	fields: [
		{
			type: 'input',
			name: 'mysql_hostname',
			message: 'What is the hostname/IP Address?',
			default: 'localhost'
		},
		{
			type: 'input',
			name: 'mysql_username',
			message: 'What is the username?',
			default: 'root'
		},
		{
			type: 'password',
			name: 'mysql_password',
			message: 'What is the password?',
			default: ''
		}
	]
};

// opts will contain answers to all field questions
function generate(appc, opts, callback) {

	var apibuilder = appc.apibuilder,
		inquirer = appc.inquirer;

	var connection = mysql.createConnection({
		host: opts.mysql_hostname,
		user: opts.mysql_username,
		password: opts.mysql_password
	});

	var db,
		tables,
		config;

	async.series([

		function(cb) {
			connection.connect(cb);
		},

		function(cb) {
			connection.query("show databases", null, function(err,results){
				if (err) { return cb(err); }
				var databases = _.reject(results, function(r){ return r.Database==='information_schema'; });
				var prompts = [
					{
						type:'list',
						name:'db',
						message: 'Which database to use?',
						choices: _.map(databases, function(n){
							return {name: n.Database, value: n.Database};
						})
					}
				];
				inquirer.prompt(prompts, function(answers) {
					db = answers.db;
					cb();
				});
			});
		},

		function(cb) {
			connection.query("use "+db, null, cb);
		},

		function(cb) {
			connection.query("show tables", null, function(err,_tables){
				if (err) { return cb(err); }
				var key = 'Tables_in_'+db;
				var prompts = [
					{
						type:'checkbox',
						name:'tables',
						message: 'Which tables to use?',
						choices: _.map(_tables, function(n){
							return {name: n[key], value: n[key], checked: true};
						})
					}
				];
				inquirer.prompt(prompts, function(answers) {
					tables = answers.tables;
					cb();
				});
			});
		},

		// generate a generic connector
		function(cb) {
			var cli = new apibuilder.CLI();
			cli.runCommand('new',['connector'],function(err,results){
				if (err) { return cb(err); }
				config = results;
				cb();
			});
		},

		// write out the configuration
		function(cb) {
			var local = path.join(config.dir, 'conf', 'local.js');
			var localConfig = {
				host: opts.mysql_hostname,
				user: opts.mysql_username,
				password: opts.mysql_password,
				database: db
			};
			var content = 'module.exports='+JSON.stringify(localConfig,'\t',4)+';';
			fs.writeFile(local, content, cb);
		},

		function(cb) {
			async.eachSeries(tables, function(table, done){
				connection.query('desc '+table, function(err,results){
					if (err) { return done(err); }

					var fields = {},
						primarykey,
						model = path.join(config.dir,'models',table.toLowerCase()+'.js'),
						obj = {
							fields: fields,
							connector: config.name,
							metadata: {}
						};

					results.forEach(function(row){
						if (row.Key === 'PRI') {
							primarykey = row.Field;
						}
						else {
							var field = {};
							fields[row.Field] = field;
							if (row.Default) {
								fields[row.Field].default = row.Default;
							}
							SetFieldType(row, field);
						}
					});


					obj.metadata[config.name] = {
						table: table
					};

					// if we don't have a primary key but we have a field, make it the primary key
					if (!primarykey && fields.id) {
						primarykey = 'id';
						delete fields.id;
					}

					if (primarykey) {
						obj.metadata[config.name].primarykey = primarykey;
					}

					var buffer = "var APIBuilder = require('apibuilder');\n\n";
					buffer+="var Model = APIBuilder.Model.extend('"+table.toLowerCase()+"',"+JSON.stringify(obj,'\t',4)+");\n\n";
					buffer+="module.exports = Model;\n";

					fs.writeFile(model, buffer, done);
				});
			},cb);
		},

		function(cb) {
			var from = path.join(__dirname,'index.tjs'),
				to = path.join(config.dir, 'lib', 'index.js'),
				fromBuf = fs.readFileSync(from).toString(),
				toBuf = _.template(fromBuf, config);
			fs.writeFile(to, toBuf, cb);
		},

		function(cb) {
			var fromPKG = require(path.join(__dirname,'..','..','package.json')),
				to = path.join(config.dir,'package.json'),
				toPKG = require(to),
				ignore = ['inquirer','appc-cli-core']; // these packages don't need to be copied since they are used by this plugin

			// TODO: Once this module is published, we can use "'^' + fromPKG.version" instead.
			toPKG.dependencies[fromPKG.name] = 'git+ssh://' + fromPKG.repository.url;

			Object.keys(fromPKG.dependencies).forEach(function(name){
				if (!(name in toPKG.dependencies) && ignore.indexOf(name)===-1) {
					toPKG.dependencies[name] = fromPKG.dependencies[name];
				}
			});

			fs.writeFile(to, JSON.stringify(toPKG,'\t',4), cb);
		},


		function(cb) {
			connection.end(cb);
		}


	], callback);

}

var StringTypeRE = /^(VARCHAR|NULL|STRING|VAR_STRING|CHAR|TEXT|MEDIUMTEXT|BLOB)/i;
var NumberTypeRE = /^(DECIMAL|TINY|SHORT|LONG|FLOAT|DOUBLE|NEWDECIMAL|INT24|BIGINT|INT|TINYINT|SMALLINT|MEDIUMINT|BIT)/i;
var DateTypeRE = /^(TIMESTAMP|DATE|TIME|DATETIME|YEAR|NEWDATE)/i;
var ArrayTypeRE = /^(ENUM|SET)/i;
var LengthRE = /\(([\d]+)\)/;
var EnumRE = /\((['\w\s,]+)\)/;

function SetFieldType(row, field) {
	var type = row.Type;

	if (StringTypeRE.test(type)) {
		field.type = 'string';
		SetFieldLength(type,field);
	}
	else if (NumberTypeRE.test(type)) {
		field.type = 'number';
		SetFieldLength(type,field);
	}
	else if (DateTypeRE.test(type)) {
		field.type = 'date';
	}
	else if (ArrayTypeRE.test(type)) {
		field.type = 'array';
		var m = EnumRE.exec(type);
		if (m && m.length > 1) {
			field.values = m[1].replace(/\'/g,'').split(',');
		}
	}
	else {
		console.log('Not sure how to handle field type:',type);
		field.type = 'object';
	}
}

function SetFieldLength(type, field) {
	if (LengthRE.test(type)) {
		var m = LengthRE.exec(type);
		field.maxlength = parseInt(m[1]);
	}
}

/*
exports.DECIMAL     = 0x00; // aka DECIMAL (http://dev.mysql.com/doc/refman/5.0/en/precision-math-decimal-changes.html)
exports.TINY        = 0x01; // aka TINYINT, 1 byte
exports.SHORT       = 0x02; // aka SMALLINT, 2 bytes
exports.LONG        = 0x03; // aka INT, 4 bytes
exports.FLOAT       = 0x04; // aka FLOAT, 4-8 bytes
exports.DOUBLE      = 0x05; // aka DOUBLE, 8 bytes
exports.NULL        = 0x06; // NULL (used for prepared statements, I think)
exports.TIMESTAMP   = 0x07; // aka TIMESTAMP
exports.LONGLONG    = 0x08; // aka BIGINT, 8 bytes
exports.INT24       = 0x09; // aka MEDIUMINT, 3 bytes
exports.DATE        = 0x0a; // aka DATE
exports.TIME        = 0x0b; // aka TIME
exports.DATETIME    = 0x0c; // aka DATETIME
exports.YEAR        = 0x0d; // aka YEAR, 1 byte (don't ask)
exports.NEWDATE     = 0x0e; // aka ?
exports.VARCHAR     = 0x0f; // aka VARCHAR (?)
exports.BIT         = 0x10; // aka BIT, 1-8 byte
exports.NEWDECIMAL  = 0xf6; // aka DECIMAL
exports.ENUM        = 0xf7; // aka ENUM
exports.SET         = 0xf8; // aka SET
exports.TINY_BLOB   = 0xf9; // aka TINYBLOB, TINYTEXT
exports.MEDIUM_BLOB = 0xfa; // aka MEDIUMBLOB, MEDIUMTEXT
exports.LONG_BLOB   = 0xfb; // aka LONGBLOG, LONGTEXT
exports.BLOB        = 0xfc; // aka BLOB, TEXT
exports.VAR_STRING  = 0xfd; // aka VARCHAR, VARBINARY
exports.STRING      = 0xfe; // aka CHAR, BINARY
exports.GEOMETRY    = 0xff; // aka GEOMETRY
*/