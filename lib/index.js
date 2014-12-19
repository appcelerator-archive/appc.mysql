var _ = require('lodash'),
	async = require('async'),
	mysql = require('../node_modules/mysql'),
	pkginfo = require('pkginfo')(module) && module.exports;

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
			this.connection = mysql.createConnection(this.config);
			this.connection.connect(function connected(err) {
				if (err) {
					callback(err);
				}
				else {
					this.logger.trace('connected');
					this.logger.trace('mysql connection id', this.connection.threadId);
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
			}.bind(this));
		},
		loginRequired: function(request, callback) {
			// only require a login if we don't already have a valid connection
			callback(null, false);
		},
		login: function(request, callback) {
			callback();
		},
		disconnect: function(callback) {
			this.logger.trace('disconnecting');
			this.connection.end(function() {
				this.logger.trace('disconnected');
				callback();
			}.bind(this));
		},

		/*
		 Metadata.
		 */
		fetchSchema: function(callback) {
			this.logger.trace('fetchSchema');
			var query = 'select * from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?';
			this.connection.query(query, [this.config.database], function(err, results) {
				if (err) { return callback(err); }
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
								type: this.convertDataTypeToJSType(object.DATA_TYPE),
								required: object.IS_NULLABLE === 'NO'
							};
						}
					}
					var Model = APIBuilder.Model.extend(pkginfo.name + '/' + modelName, {
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
			this.connection.query(query, data, function createQueryCallback(err, result) {
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
			this.connection.query(query, function findAllQueryCallback(err, results) {
				if (err) {return callback(err); }
				var rows = [];
				results.forEach(function rowIterator(row) {
					var instance = Model.instance(row, true);
					if (primaryKeyColumn) { instance.setPrimaryKey(row[primaryKeyColumn]); }
					rows.push(instance);
				});
				return callback(null, new Collection(Model, rows));
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
			this.connection.query(query, id, function findOneQueryCallback(err, rows) {
				if (err) {return callback(err); }
				if (rows.length) {
					var row = rows[0],
						instance = Model.instance(row, true);
					instance.setPrimaryKey(id);
					return callback(null, instance);
				}
				else {
					callback();
				}
			}.bind(this));
		},
		query: function(Model, options, callback) {
			var key,
				table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				keys = primaryKeyColumn,
				where = '',
				paging = '',
				order = '',
				values = [];

			if (options.sel) {
				keys += ', ' + _.keys(_.omit(options.sel, primaryKeyColumn)).join(', ');
			}
			else if (options.unsel) {
				keys += ', ' + _.keys(_.omit(_.omit(this.getTableSchema(this, Model), primaryKeyColumn), _.keys(options.unsel))).join(', ');
			}
			else {
				keys = '*';
			}

			if (options.where) {
				var firstWhere = true;
				for (key in options.where) {
					if (options.where.hasOwnProperty(key) && options.where[key] !== undefined) {
						if (firstWhere) {
							where = ' WHERE';
						}
						if (!firstWhere) {
							where += ' AND';
						}
						where += ' ' + key;
						firstWhere = false;
						if (options.where[key] && options.where[key].$like) {
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
			this.logger.trace('query query:', query);
			this.logger.trace('query query values:', values);
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
			this.connection.query(query, values, function createQueryCallback(err, result) {
				if (err) {return callback(err); }
				if (result && result.affectedRows) {
					callback(null, instance);
				}
				else {
					callback();
				}
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
			this.connection.query(query, instance.getPrimaryKey(), function deleteQueryCallback(err, result) {
				if (err) {return callback(err); }
				if (result && result.affectedRows) {
					callback(null, instance);
				}
				else {
					callback();
				}
			});
		},
		deleteAll: function(Model, callback) {
			var table = this.getTableName(Model),
				primaryKeyColumn = this.getPrimaryKeyColumn(this, Model),
				query = 'DELETE FROM ' + table;
			if (!primaryKeyColumn) {
				return callback(new APIBuilder.ORMError("can't find primary key column for " + table));
			}
			this.logger.trace('deleteAll query:', query);
			this.connection.query(query, function deleteAllQueryCallback(err, result) {
				if (err) {return callback(err); }
				if (result && result.affectedRows) {
					callback(null, result.affectedRows);
				}
				else {
					callback();
				}
			});
		},

		/*
		 Utilities only used for this connector.
		 */
		fetchColumns: function fetchColumns(table, payload) {
			return _.intersection(Object.keys(payload), Object.keys(this.schema.objects[table]));
		},
		getTableName: function getTableName(Model) {
			return Model.getMeta('table') || Model._supermodel || Model.name;
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
