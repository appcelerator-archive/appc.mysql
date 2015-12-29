var Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Queries for particular model records.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {ArrowQueryOptions} options Query options.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the model records.
 * @throws {Error} Failed to parse query options.
 */
exports.query = function (Model, options, callback) {
	// TODO: Parse through this and think about injection attack vectors.
	var self = this,
		table = this.getTableName(Model),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model),
		keys = primaryKeyColumn,
		whereQuery = '',
		pagingQuery = '',
		orderQuery = '',
		values = [];

	var sel = Model.translateKeysForPayload(options.sel),
		unsel = Model.translateKeysForPayload(options.unsel);
	if (sel && Object.keys(sel).length > 0) {
		keys += ', ' + this.escapeKeys(_.keys(_.omit(sel, primaryKeyColumn))).join(', ');
	} else if (unsel && Object.keys(unsel).length > 0) {
		keys += ', ' + this.escapeKeys(_.keys(_.omit(_.omit(this.getTableSchema(Model), primaryKeyColumn), _.keys(unsel)))).join(', ');
	} else {
		keys = '*';
	}

	var where = Model.translateKeysForPayload(options.where);
	if (where && Object.keys(where).length > 0) {
		whereQuery = this.translateWhereToQuery(where, values);
	}

	var order = Model.translateKeysForPayload(options.order);
	if (order && Object.keys(order).length > 0) {
		orderQuery = ' ORDER BY';
		Object.keys(order).forEach(function (key) {
			orderQuery += ' ' + key + ' ';
			var orderKey = order[key];
			if (typeof orderKey === 'string') {
				orderKey = orderKey.toLowerCase();
			}
			if (orderKey === 1 || orderKey === true || orderKey === '1' || orderKey === 'true') {
				orderQuery += 'ASC';
			} else {
				orderQuery += 'DESC';
			}
			orderQuery += ',';
		});
		orderQuery = orderQuery.slice(0, -1);
	}

	pagingQuery += ' LIMIT ' + (+options.limit);
	if (options.skip) {
		pagingQuery += ' OFFSET ' + (+options.skip);
	}

	var query = 'SELECT ' + keys + ' FROM ' + table + whereQuery + orderQuery + pagingQuery;
	this._query(query, values, callback, function (results) {
		if (results) {
			callback(null, new Arrow.Collection(Model, results.map(function (row) {
				return self.getInstanceFromRow(Model, row);
			})));
		} else {
			callback();
		}
	});
};
