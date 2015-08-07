var _ = require('lodash');

exports.fetchColumns = function fetchColumns(table, payload) {
	if (this.schema.objects[table]) {
		return _.intersection(Object.keys(payload), Object.keys(this.schema.objects[table]));
	}
	return Object.keys(payload);
};
