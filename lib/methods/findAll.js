var Arrow = require('arrow');

/**
 * Finds all model instances.  A maximum of 1000 models are returned.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the models.
 */
exports.findAll = function (Model, callback) {
	var self = this,
		table = this.getTableName(Model),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model);

	var query = 'SELECT ' +
		(primaryKeyColumn ? primaryKeyColumn + ', ' : '') + this.escapeKeys(Model.payloadKeys()).join(', ') +
		' FROM ' + table + (primaryKeyColumn ? ' ORDER BY ' + primaryKeyColumn : '') + ' LIMIT 1000';

	this._query(query, callback, function (results) {
		var rows = [];
		results.forEach(function (row) {
			rows.push(self.getInstanceFromRow(Model, row));
		});
		callback(null, new Arrow.Collection(Model, rows));
	});
};
