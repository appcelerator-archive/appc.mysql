var _ = require('lodash');

/**
 * Creates a new Model or Collection object.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Array<Object>/Object} [values] Attributes to set on the new model(s).
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
	}
	else {
		query = 'INSERT INTO ' + table + ' (' + primaryKeyColumn + ',' + this.escapeKeys(columns).join(',') + ') VALUES (NULL, ' + placeholders.join(',') + ')';
	}
	var data = _.values(payload);
	this._query(query, data, callback, function (result) {
		if (result && result.affectedRows) {
			var instance = Model.instance(values),
				primaryKey = primaryKeyColumn && self.metadata.schema.objects[table][primaryKeyColumn];
			// if this is an auto_increment int primary key, we can just set it from result,
			// otherwise we need to fetch it
			if (primaryKey) {
				if (primaryKey.EXTRA === 'auto_increment') {
					instance.setPrimaryKey(result.insertId);
					callback(null, instance);
				}
				else {
					self.logger.warn("Not sure how to handle result with non auto_increment primary key type", query);
					callback(new Arrow.ORMError("Not sure how to handle result with non auto_increment primary key type"));
				}
			}
			else {
				callback(null, instance);
			}
		}
		else {
			callback();
		}
	});
};
