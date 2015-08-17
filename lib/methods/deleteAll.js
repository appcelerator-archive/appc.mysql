/**
 * Deletes all the data records.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful), and the deleted models.
 */
exports.deleteAll = function (Model, callback) {
	var table = this.getTableName(Model),
		query = 'DELETE FROM ' + table;

	this._query(query, callback, function (result) {
		if (result) {
			callback(null, result.affectedRows || 0);
		}
		else {
			callback();
		}
	});
};
