/**
 * Gets the table name from the provided model.
 * @param Model
 * @returns {string}
 */
exports.getTableName = function getTableName(Model) {
	var parent = Model;
	while (parent._parent && parent._parent.name) {
		parent = parent._parent;
	}
	var table = Model.getMeta('table') || parent.name || Model._supermodel || Model.name;
	table = table.split('/').pop();
	return table;
};
