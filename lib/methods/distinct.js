exports.distinct = function distinct(Model, field, options, next) {
	var self = this,
		table = this.getTableName(Model),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model),
		values = [],
		whereQuery = '';

	var where = Model.translateKeysForPayload(options.where);
	if (where && Object.keys(where).length > 0) {
		var firstWhere = true;
		for (var key in where) {
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

	var query = 'SELECT DISTINCT ' + field + ' ' +
		'FROM ' + table + whereQuery + ' ' +
		'ORDER BY ' + primaryKeyColumn + ' ' +
		'LIMIT 1000';

	this.logger.trace('distinct query:', query);
	this.getConnection(function (err, connection) {
		if (err) { return next(err); }
		connection.query(query, values, function distinctQueryCallback(err, results) {
			if (self.pool) {
				connection.release();
			}
			if (err) {
				next(err);
			}
			else {
				next(null, results.map(function (element) {
					return element[field];
				}));
			}
		});
	});
};
