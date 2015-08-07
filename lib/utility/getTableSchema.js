exports.getTableSchema = function getTableSchema(Model) {
	var name = this.getTableName(Model);
	return this.schema.objects[name];
};
