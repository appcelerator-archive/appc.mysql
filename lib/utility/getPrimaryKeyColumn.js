/**
 * Gets the primary key column for the provided model.
 * @param Model
 * @returns {*}
 */
exports.getPrimaryKeyColumn = function getPrimaryKeyColumn (Model) {
  var pk = Model.getMeta('primarykey')

  if (pk) {
    return pk
  }

  var name = this.getTableName(Model)
  var tableSchema = this.getTableSchema(Model)
  var primaryKeyColumn = this.metadata.schema.primary_keys[name]
  var column = primaryKeyColumn && tableSchema && tableSchema[primaryKeyColumn]

  return column && column.COLUMN_NAME
}
