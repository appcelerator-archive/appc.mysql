var _ = require('lodash'),
	appc = require('appc-cli-core'),
	async = require('async'),
	format = require('util').format,
	inquirer = require('inquirer'),
	mysql = require('mysql');

var TYPE = require('../../appc').TYPE;

module.exports = {
	name: 'MYSQL Database',
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
function generate(opts, callback) {

	var connection = mysql.createConnection({
		host: opts.mysql_hostname,
		user: opts.mysql_username,
		password: opts.mysql_password
	});

	var db,
		tables;

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
			connection.query("show tables", null, function(err,tables){
				if (err) { return cb(err); }
				var key = 'Tables_in_'+db;
				var prompts = [
					{
						type:'checkbox',
						name:'tables',
						message: 'Which tables to use?',
						choices: _.map(tables, function(n){
							return {name: n[key], value: n[key], checked: true};
						})
					}
				];
				inquirer.prompt(prompts, function(answers) {
					tables = answers.tables;
					cb();
				});
			});
		}


	], function(err){
		if (err) { return callback(err); }

		callback();
	});

}

