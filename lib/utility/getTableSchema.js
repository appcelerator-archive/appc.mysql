/**
 * Fetches the correct table schema for the model, based on its name.
 * @param Model
 * @returns {*}
 */
exports.getTableSchema = function getTableSchema(Model) {
	var name = this.getTableName(Model);
	return this.schema.objects[name];
};
