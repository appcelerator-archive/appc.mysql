var Arrow = require('arrow')
var _ = require('lodash')

/**
 * Updates a Model instance.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Arrow.Instance} instance Model instance to update.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the updated model.
 */
exports.save = function (Model, instance, callback) {
  var table = this.getTableName(Model)
  table = this.escapeKeys([table])[0]
  var payload = instance.toPayload()
  var primaryKeyColumn = this.getPrimaryKeyColumn(Model)
  var columns = this.escapeKeys(this.fetchColumns(table, payload))
  var placeholders = columns.map(function (name) { return name + ' = ?' })
  var query = 'UPDATE ' + table + ' SET ' + placeholders.join(',') + ' WHERE ' + primaryKeyColumn + ' = ?'
  if (!primaryKeyColumn) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + table))
  }
  var values = _.values(payload).concat([instance.getPrimaryKey()])

  this._query(query, values, callback, function (result) {
    if (result && result.affectedRows) {
      callback(null, instance)
    } else {
      callback()
    }
  })
}
