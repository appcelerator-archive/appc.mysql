/**
 * Searches for distinct rows in the database.
 * @param Model
 * @param field
 * @param options
 * @param callback
 */
exports.distinct = function distinct(Model, field, options, callback) {
	var table = this.getTableName(Model),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model),
		values = [],
		whereQuery = '';

	var where = Model.translateKeysForPayload(options.where);
	if (where && Object.keys(where).length > 0) {
		whereQuery = this.translateWhereToQuery(where, values);
	}

	var query = 'SELECT DISTINCT ' + field + ' ' +
		'FROM ' + table + whereQuery + ' ' +
		'ORDER BY ' + primaryKeyColumn + ' ' +
		'LIMIT 1000';

	this._query(query, values, callback, function (results) {
		if (results) {
			callback(null, results.map(function (element) {
				return element[field];
			}));
		} else {
			callback();
		}
	});
};
