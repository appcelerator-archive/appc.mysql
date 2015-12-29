var _ = require('lodash');

/**
 * Creates a new Model or Collection object.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Object} [values] Attributes to set on the new model(s).
 * @param {Function} callback Callback passed an Error object (or null if successful), and the new model or collection.
 * @throws {Error}
 */
exports.create = function (Model, values, callback) {
	var self = this,
		table = this.getTableName(Model),
		payload = Model.instance(values, false).toPayload(),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model),
		columns = this.fetchColumns(table, payload),
		placeholders = columns.map(this.returnPlaceholder),
		query;

	if (!primaryKeyColumn) {
		query = 'INSERT INTO ' + table + ' (' + this.escapeKeys(columns).join(',') + ') VALUES (' + placeholders.join(',') + ')';
	} else {
		query = 'INSERT INTO ' + table + ' (' + primaryKeyColumn + ',' + this.escapeKeys(columns).join(',') + ') VALUES (NULL, ' + placeholders.join(',') + ')';
	}
	var data = _.values(payload);
	this._query(query, data, callback, function (result) {
		var instance = Model.instance(values),
			primaryKey = primaryKeyColumn && self.metadata.schema.objects[table][primaryKeyColumn];
		if (primaryKey && primaryKey.EXTRA === 'auto_increment') {
			instance.setPrimaryKey(result.insertId);
		}
		callback(null, instance);
	});
};
