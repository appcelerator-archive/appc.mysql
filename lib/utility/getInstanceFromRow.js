/**
 * Creates a model instance based on the provided row data.
 * @param Model
 * @param row
 */
exports.getInstanceFromRow = function (Model, row) {
	var primaryKeyColumn = this.getPrimaryKeyColumn(Model),
		instance = Model.instance(row, true);
	if (primaryKeyColumn) {
		instance.setPrimaryKey(row[primaryKeyColumn]);
	}
	return instance;
};
