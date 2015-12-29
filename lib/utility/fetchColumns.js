var _ = require('lodash');

/**
 * Fetches the columns from the table based on the specified payload.
 * @param table
 * @param payload
 * @returns {*}
 */
exports.fetchColumns = function fetchColumns(table, payload) {
	if (this.schema.objects[table]) {
		return _.intersection(Object.keys(payload), Object.keys(this.schema.objects[table]));
	}
	return Object.keys(payload);
};
