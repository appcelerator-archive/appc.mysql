var _ = require('lodash'),
	async = require('async'),
	mysql = require('../node_modules/mysql'),
	pkginfo = require('pkginfo')(module) && module.exports,
	defaultConfig = require('fs').readFileSync(__dirname + '/../conf/example.config.js', 'utf8');

// --------- MYSQL DB Connector -------

exports.create = function(APIBuilder, server) {
	var Connector = APIBuilder.Connector,
		Collection = APIBuilder.Collection;

	return Connector.extend({

		/*
		 Configuration.
		 */
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: APIBuilder.createLogger({}, { name: pkginfo.name, useConsole: true, level: 'debug' }),

		/*
		 Lifecycle.
		 */
		connect: function(callback) {
			this.logger.trace('connecting');

			var connected = function connectedCallback(err) {
				if (err) {
					callback(err);
				}
				else {
					this.logger.trace('connected');
					this.fetchSchema(function fetchedSchema(err, schema) {
						if (err) {
							callback(err);
						}
						else {
							this.schema = schema;
							if (!this.config.dontGenerateModelsFromSchema) {
								this.createModelsFromSchema();
							}
							callback();
						}
					}.bind(this));
				}
			}.bind(this);

			if (this.config.connection_pooling) {
				this.pool = mysql.createPool(this.config);
				this.pool.getConnection(function pooledGetConnection(err, connection) {
					if (err) {
						callback(err);
					}
					else {
						connection.release();
						connected(err);
					}
				}.bind(this));
			}
			else {
				this.connection = mysql.createConnection(this.config);
				this.connection.connect(connected);
			}
		},
		disconnect: function(callback) {
			this.logger.trace('disconnecting');
			(this.pool || this.connection).end(function() {
				this.logger.trace('disconnected');
				callback();
			}.bind(this));
		},

		/*
		 Metadata.
		 */
		defaultConfig: defaultConfig,
		fetchSchema: function(callback) {
			this.logger.trace('fetchSchema');
			var query = 'select * from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?';
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, [this.config.database], function(err, results) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else {
						var schema = { objects: {}, database: this.config.database, primary_keys: {} };
						results.forEach(function resultCallback(result) {
							var entry = schema.objects[result.TABLE_NAME];
							if (!entry) {
								schema.objects[result.TABLE_NAME] = entry = {};
							}
							entry[result.COLUMN_NAME] = result;
							if (result.COLUMN_KEY === 'PRI') {
								schema.primary_keys[result.TABLE_NAME] = result.COLUMN_NAME;
							}
						});
						callback(null, schema);
					}
				}.bind(this));
			}.bind(this));
		},
		createModelsFromSchema: function() {
			var models = {};
			for (var modelName in this.schema.objects) {
				if (this.schema.objects.hasOwnProperty(modelName)) {
					var object = this.schema.objects[modelName],
						fields = {};
					for (var fieldName in object) {
						if (object.hasOwnProperty(fieldName)) {
							if (fieldName === 'id') {
								continue;
							}
							fields[fieldName] = {
								type: this.convertDataTypeToJSType(object[fieldName].DATA_TYPE),
								required: object.IS_NULLABLE === 'NO'
							};
						}
					}

					var Model = APIBuilder.Model.extend(pkginfo.name + '/' + modelName, {
						name: pkginfo.name + '/' + modelName,
						autogen: this.config.modelAutogen === undefined ? true : this.config.modelAutogen,
						fields: fields,
						connector: this
					});
					models[pkginfo.name + '/' + modelName] = Model;
					if (server) {
						server.addModel(Model);
					}
				}
			}
			this.models = _.defaults(this.models || {}, models);
			if (server) {
				server.registerModelsForConnector(this, this.models);
			}
		},

		/*
		 CRUD.
		 */
		create: function(Model, values, callback) {
			var table = this.getTableName(Model),
				payload = Model.instance(values, false).toPayload(),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				columns = this.fetchColumns(table, payload),
				placeholders = columns.map(function() { return '?'; }),
				query;

			if (!primaryKeyColumn) {
				query = 'INSERT INTO ' + table + ' (' + columns.join(',') + ') values (' + placeholders.join(',') + ')';
			}
			else {
				query = 'INSERT INTO ' + table + ' (' + primaryKeyColumn + ',' + columns.join(',') + ') values (NULL, ' + placeholders.join(',') + ')';
			}
			var data = _.values(payload);
			this.logger.trace('create query:', query);
			this.logger.trace('create query values:', data);
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, data, function createQueryCallback(err, result) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else if (result && result.affectedRows) {
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
			}.bind(this));
		},
		findAll: function(Model, callback) {
			var table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				query;

			if (primaryKeyColumn) {
				query = 'select ' + primaryKeyColumn + ', ' + Model.payloadKeys().join(', ') + ' from ' + table;
			}
			else {
				query = 'select ' + Model.payloadKeys().join(', ') + ' from ' + table;
			}
			this.logger.trace('findAll query:', query);
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, function findAllQueryCallback(err, results) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else {
						var rows = [];
						results.forEach(function rowIterator(row) {
							var instance = Model.instance(row, true);
							if (primaryKeyColumn) { instance.setPrimaryKey(row[primaryKeyColumn]); }
							rows.push(instance);
						});
						callback(null, new Collection(Model, rows));
					}
				}.bind(this));
			}.bind(this));
		},
		findOne: function(Model, id, callback) {
			var table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				query = 'select ' + Model.payloadKeys().join(', ') + ' from ' + table + ' where ' + primaryKeyColumn + ' = ? LIMIT 1';
			if (!primaryKeyColumn) {
				return callback(new APIBuilder.ORMError("can't find primary key column for " + table));
			}
			this.logger.trace('findOne query:', query);
			this.logger.trace('findOne query values:', id);
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, id, function findOneQueryCallback(err, rows) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else if (rows.length) {
						var row = rows[0],
							instance = Model.instance(row, true);
						instance.setPrimaryKey(id);
						callback(null, instance);
					}
					else {
						callback();
					}
				}.bind(this));
			}.bind(this));
		},
		query: function(Model, options, callback) {
			// TODO: Parse through this and think about injection attack vectors.
			var key,
				table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				keys = primaryKeyColumn,
				whereQuery = '',
				pagingQuery = '',
				orderQuery = '',
				values = [];

			var sel = Model.translateKeysForPayload(options.sel),
				unsel = Model.translateKeysForPayload(options.unsel);
			if (sel) {
				keys += ', ' + _.keys(_.omit(sel, primaryKeyColumn)).join(', ');
			}
			else if (unsel) {
				keys += ', ' + _.keys(_.omit(_.omit(this.getTableSchema(this, Model), primaryKeyColumn), _.keys(unsel))).join(', ');
			}
			else {
				keys = '*';
			}

			var where = Model.translateKeysForPayload(options.where);
			if (where && Object.keys(where).length > 0) {
				var firstWhere = true;
				for (key in where) {
					if (where.hasOwnProperty(key) && where[key] !== undefined) {
						if (firstWhere) {
							whereQuery = ' WHERE';
						}
						if (!firstWhere) {
							whereQuery += ' AND';
						}
						whereQuery += ' ' + key;
						firstWhere = false;
						if (where[key] && where[key].$like) {
							whereQuery += ' LIKE';
							values.push(where[key].$like);
						}
						else {
							whereQuery += ' =';
							values.push(where[key]);
						}
						whereQuery += ' ?';
					}
				}
			}

			var order = Model.translateKeysForPayload(options.order);
			if (order) {
				orderQuery = ' ORDER BY';
				for (key in order) {
					if (order.hasOwnProperty(key)) {
						orderQuery += ' ' + key + ' ';
						if (order[key] == 1) {
							orderQuery += 'ASC';
						}
						else {
							orderQuery += 'DESC';
						}
						orderQuery += ',';
					}
				}
				if (orderQuery[orderQuery.length - 1] === ',') {
					orderQuery = orderQuery.slice(0, -1);
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
			pagingQuery += ' LIMIT ' + (+options.limit);
			if (options.skip) {
				pagingQuery += ' OFFSET ' + (+options.skip);
			}

			var query = 'SELECT ' + keys + ' FROM ' + table + whereQuery + orderQuery + pagingQuery;
			this.logger.trace('query query:', query);
			this.logger.trace('query query values:', values);
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, values, function findQueryCallback(err, results) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else if (results) {
						var rows = [];
						results.forEach(function rowIterator(row) {
							var instance = Model.instance(row, true);
							if (primaryKeyColumn) {
								instance.setPrimaryKey(row[primaryKeyColumn]);
							}
							rows.push(instance);
						});
						callback(null, new Collection(Model, rows));
					}
					else {
						callback();
					}
				}.bind(this));
			}.bind(this));
		},
		save: function(Model, instance, callback) {
			var table = this.getTableName(Model),
				payload = instance.toPayload(),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				columns = this.fetchColumns(table, payload),
				placeholders = columns.map(function(name) { return name + ' = ?'; }),
				query = 'UPDATE ' + table + ' SET ' + placeholders.join(',') + ' WHERE ' + primaryKeyColumn + ' = ?';
			if (!primaryKeyColumn) {
				return callback(new APIBuilder.ORMError("can't find primary key column for " + table));
			}
			var values = _.values(payload).concat([instance.getPrimaryKey()]);
			this.logger.trace('save query:', query);
			this.logger.trace('save query value:', values);
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, values, function createQueryCallback(err, result) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else if (result && result.affectedRows) {
						callback(null, instance);
					}
					else {
						callback();
					}
				}.bind(this));
			}.bind(this));
		},
		'delete': function(Model, instance, callback) {
			var table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				query = 'DELETE FROM ' + table + ' WHERE ' + primaryKeyColumn + ' = ?';
			if (!primaryKeyColumn) {
				return callback(new APIBuilder.ORMError("can't find primary key column for " + table));
			}
			this.logger.trace('delete query:', query);
			this.logger.trace('delete query value:', instance.getPrimaryKey());
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, instance.getPrimaryKey(), function deleteQueryCallback(err, result) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else if (result && result.affectedRows) {
						callback(null, instance);
					}
					else {
						callback();
					}
				}.bind(this));
			}.bind(this));
		},
		deleteAll: function(Model, callback) {
			var table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				query = 'DELETE FROM ' + table;
			if (!primaryKeyColumn) {
				return callback(new APIBuilder.ORMError("can't find primary key column for " + table));
			}
			this.logger.trace('deleteAll query:', query);
			this.getConnection(function(err, connection) {
				if (err) { return callback(err); }
				connection.query(query, function deleteAllQueryCallback(err, result) {
					if (this.pool) {
						connection.release();
					}
					if (err) {
						callback(err);
					}
					else if (result && result.affectedRows) {
						callback(null, result.affectedRows);
					}
					else {
						callback();
					}
				}.bind(this));
			}.bind(this));
		},

		/*
		 Utilities only used for this connector.
		 */
		getTableName: function getTableName(Model) {
			var parent = Model;
			while (parent._parent && parent._parent.name) {
				parent = parent._parent;
			}
			var table = Model.getMeta('table') || parent.name || Model._supermodel || Model.name;
			if (table.indexOf(pkginfo.name + '/') >= 0) {
				table = table.replace(pkginfo.name + '/', '');
			}
			return table;
		},
		fetchColumns: function fetchColumns(table, payload) {
			return _.intersection(Object.keys(payload), Object.keys(this.schema.objects[table]));
		},
		getConnection: function getConnection(callback) {
			if (this.pool) {
				this.pool.getConnection(function pooledGetConnection(err, connection) {
					callback(err, connection);
				});
			}
			else {
				callback(null, this.connection);
			}
		},
		getPrimaryKeyColumn: function getPrimaryKeyColumn(connector, Model) {
			var pk = Model.getMeta('primarykey');
			if (pk) {
				return pk;
			}
			var name = this.getTableName(Model),
				tableSchema = this.getTableSchema(connector, Model),
				primaryKeyColumn = connector.metadata.schema.primary_keys[name],
				column = primaryKeyColumn && tableSchema && tableSchema[primaryKeyColumn];

			return column && column.COLUMN_NAME;
		},
		getTableSchema: function getTableSchema(connector, Model) {
			var name = this.getTableName(Model);
			return connector.metadata.schema.objects[name];
		},
		convertDataTypeToJSType: function convertDataTypeToJSType(dataType) {
			switch (dataType) {
				case 'tinyint':
				case 'smallint':
				case 'mediumint':
				case 'bigint':
				case 'int':
				case 'integer':
				case 'float':
				case 'bit':
				case 'double':
				case 'binary':
					return Number;
				case 'date':
				case 'datetime':
				case 'time':
				case 'year':
					return Date;
				default:
					return String;
			}
		}

	});

};
