var APIBuilder = require('apibuilder'),
	_ = require('lodash'),
	async = require('async'),
	mysql = require('mysql'),
	pkginfo = require('pkginfo')(module),
	pkginfo = module.exports,
	Connector = APIBuilder.Connector,
	Collection = APIBuilder.Collection,
	Instance = APIBuilder.Instance;

// --------- MYSQL DB connector -------

module.exports = Connector.extend({

	// generated configuration

	config: APIBuilder.Loader(), // load default server config
	name: 'appc.mysql', // name of the connector
	pkginfo: _.pick(pkginfo,'name','version','description','author','license','keywords','repository'),
	logger: APIBuilder.createLogger({},{name:'appc.mysql',useConsole:true,level:'debug'}),

	// implementation

	constructor: function() {
		// only used by this connector
	},

	fetchConfig: function(next) {
		next(null, this.config);
	},

	fetchMetadata: function(callback) {
		callback();
	},

	fetchSchema: function(callback) {
		this.logger.debug('fetchSchema');
		var query = 'select * from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?';
		this.connection.query(query,[this.config.database], function(err,results){
			if (err) { return callback(err); }
			var schema = { objects : {}, database: this.config.database, primary_keys: {} };
			results.forEach(function resultCallback(result){
				var entry = schema.objects[result.TABLE_NAME];
				if (!entry) {
					schema.objects[result.TABLE_NAME] = entry = {};
				}
				entry[result.COLUMN_NAME] = result;
				if (result.COLUMN_KEY==='PRI') {
					schema.primary_keys[result.TABLE_NAME] = result.COLUMN_NAME;
				}
			});
			callback(null, schema);
		}.bind(this));
	},

	connect: function(callback) {
		this.logger.debug('connecting');
		this.connection = mysql.createConnection(this.config);
		this.connection.connect(function(err){
			this.logger.debug('connected');
			this.logger.debug('mysql connection id',this.connection.threadId);
			callback(err);
		}.bind(this));
	},

	disconnect: function(callback) {
		this.logger.debug('disconnecting');
		this.connection.end(function(){
			this.logger.debug('disconnected');
			callback();
		}.bind(this));
	},

	loginRequired: function(request, callback) {
		// only require a login if we don't already have a valid connection
		callback(null, false);
	},

	login: function(request, callback) {
		callback();
	},

	create: function (Model, values, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			columns = Model.keys(),
			placeholders = columns.map(function(){ return '?'; }),
			query;
		if (!primaryKeyColumn) {
			query = 'INSERT INTO ' + table + ' (' + columns.join(',') + ') values ('+placeholders.join(',') + ')';
		}
		else {
			query = 'INSERT INTO ' + table + ' (' +primaryKeyColumn+',' + columns.join(',') + ') values (NULL, '+placeholders.join(',') + ')';
		}
		var data = _.values(values);
		this.logger.debug('create query:',query);
		this.logger.debug('create query values:',data);
		this.connection.query(query, data, function createQueryCallback(err, result){
			if (err) {return callback(err); }
			if (result && result.affectedRows) {
				var instance = Model.instance(values),
					primaryKey = primaryKeyColumn && this.metadata.schema.objects[table][primaryKeyColumn];
				// if this is an auto_increment int primary key, we can just set it from result,
				// otherwise we need to fetch it
				if (primaryKey) {
					if (primaryKey.EXTRA === 'auto_increment') {
						instance.setPrimaryKey(result.insertId);
						callback(null, instance);
					}
					else {
						//TODO: not sure what to do for this...
						this.logger.warn("Not sure how to handle result with non auto_increment primary key type", query);
						callback(new APIBuilder.ORMError("Not sure how to handle result with non auto_increment primary key type"));
					}
				}
				else {
					callback(null, instance);
				}
			}
			else {
				callback();
			}
		}.bind(this));
	},

	save: function (Model, instance, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			columns = Model.keys(),
			placeholders = columns.map(function(name){ return name + ' = ?'; }),
			query = 'UPDATE ' + table + ' SET ' + placeholders.join(',') + ' WHERE '+primaryKeyColumn + ' = ?';
		if (!primaryKeyColumn) {
			return callback(new APIBuilder.ORMError("can't find primary key column for "+table));
		}
		var values = _.values(instance.values()).concat([instance.getPrimaryKey()]);
		this.logger.debug('save query:',query);
		this.logger.debug('save query value:',values);
		this.connection.query(query, values, function createQueryCallback(err, result){
			if (err) {return callback(err); }
			if (result && result.affectedRows) {
				callback(null, instance);
			}
			else {
				callback();
			}
		}.bind(this));
	},

	delete: function (Model, instance, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			query = 'DELETE FROM ' + table + ' WHERE ' + primaryKeyColumn + ' = ?';
		if (!primaryKeyColumn) {
			return callback(new APIBuilder.ORMError("can't find primary key column for "+table));
		}
		this.logger.debug('delete query:',query);
		this.logger.debug('delete query value:',instance.getPrimaryKey());
		this.connection.query(query, instance.getPrimaryKey(), function deleteQueryCallback(err, result){
			if (err) {return callback(err); }
			if (result && result.affectedRows) {
				callback(null, instance);
			}
			else {
				callback();
			}
		});
	},

	deleteAll: function (Model, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			query = 'DELETE FROM ' + table;
		if (!primaryKeyColumn) {
			return callback(new APIBuilder.ORMError("can't find primary key column for "+table));
		}
		this.logger.debug('deleteAll query:',query);
		this.connection.query(query, function deleteAllQueryCallback(err, result){
			if (err) {return callback(err); }
			if (result && result.affectedRows) {
				callback(null, result.affectedRows);
			}
			else {
				callback();
			}
		});
	},

	find: function (Model, properties, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			keys = _.keys(_.omit(properties, primaryKeyColumn)),
			values = _.values(_.omit(properties, primaryKeyColumn), keys),
			query = 'select ' + primaryKeyColumn + ', '  + keys.join(', ') + ' from '+table + ' WHERE ' + keys.map(function(k){return k+' = ?'; });
		if (!primaryKeyColumn) {
			return callback(new APIBuilder.ORMError("can't find primary key column for "+table));
		}
		this.logger.debug('find query:',query);
		this.logger.debug('find query values:',values);
		this.connection.query(query, values, function findQueryCallback(err,results){
			if (err) {return callback(err); }
			if (results) {
				var rows = [];
				results.forEach(function rowIterator(row){
					var instance = Model.instance(row,true);
					instance.setPrimaryKey(row[primaryKeyColumn]);
					rows.push(instance);
				});
				return callback(null, new Collection(Model,rows));
			}
			else {
				callback();
			}
		}.bind(this));
	},

	query: function (Model, options, callback) {
		var key,
			table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this, Model),
			keys = primaryKeyColumn,
			where = '',
			paging = '',
			order = '',
			values = [];

		if (options.sel) {
			keys += ', ' + _.keys(_.omit(options.sel, primaryKeyColumn)).join(', ');
		}
		else if (options.unsel) {
			keys += ', ' + _.keys(_.omit(_.omit(getTableSchema(this, Model), primaryKeyColumn), _.keys(options.unsel))).join(', ');
		}
		else {
			keys += ', ' + _.keys(_.omit(getTableSchema(this, Model), primaryKeyColumn)).join(', ');
		}

		if (options.where) {
			where = ' WHERE';
			for (key in options.where) {
				if (options.where.hasOwnProperty(key)) {
					where += ' ' + key;
					if (options.where[key].$like) {
						where += ' LIKE';
						values.push(options.where[key].$like);
					}
					else {
						where += ' =';
						values.push(options.where[key]);
					}
					where += ' ?';
				}
			}
		}

		if (options.order) {
			order = ' ORDER BY';
			for (key in options.order) {
				if (options.order.hasOwnProperty(key)) {
					order += ' ' + key + ' ';
					if (options.order[key] === 1) {
						order += 'ASC';
					}
					else {
						order += 'DESC';
					}
					order += ',';
				}
			}
			if (order[order.length - 1] === ',') {
				order = order.slice(0, -1);
			}
		}

		if (options.page && options.per_page) {
			// Translate page/per_page to skip/limit, because that's what we can handle.
			options.skip = (options.page - 1) * options.per_page;
			options.limit = options.per_page;
		}
		if (!options.limit) {
			options.limit = 10;
		}
		paging += ' LIMIT ' + (+options.limit);
		if (options.skip) {
			paging += ' OFFSET ' + (+options.skip);
		}

		var query = 'SELECT ' + keys + ' FROM ' + table + where + order + paging;
		this.logger.debug('query query:', query);
		this.logger.debug('query query values:', values);
		this.connection.query(query, values, function findQueryCallback(err, results) {
			if (err) {return callback(err); }
			if (results) {
				var rows = [];
				results.forEach(function rowIterator(row) {
					var instance = Model.instance(row, true);
					if (primaryKeyColumn) {
						instance.setPrimaryKey(row[primaryKeyColumn]);
					}
					rows.push(instance);
				});
				return callback(null, new Collection(Model, rows));
			}
			else {
				callback();
			}
		}.bind(this));
	},

	findAll: function (Model, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			query;

		if (primaryKeyColumn) {
			query = 'select ' + primaryKeyColumn + ', ' + Model.keys().join(', ') + ' from '+table;
		}
		else {
			query = 'select ' + Model.keys().join(', ') + ' from '+table;
		}
		this.logger.debug('findAll query:',query);
		this.connection.query(query, function findAllQueryCallback(err,results){
			if (err) {return callback(err); }
			var rows = [];
			results.forEach(function rowIterator(row){
				var instance = Model.instance(row,true);
				primaryKeyColumn && instance.setPrimaryKey(row[primaryKeyColumn]);
				rows.push(instance);
			});
			return callback(null, new Collection(Model,rows));
		}.bind(this));
	},

	findOne: function (Model, id, callback) {
		var table = getTableName(Model),
			primaryKeyColumn = getPrimaryKeyColumn(this,Model),
			query = 'select ' + Model.keys().join(', ') + ' from ' + table + ' where ' + primaryKeyColumn + ' = ? LIMIT 1';
		if (!primaryKeyColumn) {
			return callback(new APIBuilder.ORMError("can't find primary key column for "+table));
		}
		this.logger.debug('findOne query:',query);
		this.logger.debug('findOne query values:',id);
		this.connection.query(query, id, function findOneQueryCallback(err,rows){
			if (err) {return callback(err); }
			if (rows.length) {
				var row = rows[0],
					instance = Model.instance(row,true);
				instance.setPrimaryKey(id);
				return callback(null, instance);
			}
			else {
				callback();
			}
		}.bind(this));
	}

});

// utilities only needed for this connector

function getTableName(Model) {
	return Model.getMeta('table') || Model.name;
}

function getPrimaryKeyColumn(connector, Model) {
	var pk = Model.getMeta('primarykey');
	if (pk) {
		return pk;
	}
	var name = getTableName(Model),
		tableSchema = getTableSchema(connector, Model),
		primaryKeyColumn = connector.metadata.schema.primary_keys[name],
		column = primaryKeyColumn && tableSchema && tableSchema[primaryKeyColumn];

	return column && column.COLUMN_NAME;
}

function getTableSchema(connector, Model) {
	var name = getTableName(Model);
	return connector.metadata.schema.objects[name];
}