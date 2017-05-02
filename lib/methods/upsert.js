/**
 * Updates a model or creates the model if it cannot be found.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {String} id ID of the model to update.
 * @param {Object} doc Model attributes to set.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the updated or new model.
 */

var _ = require('lodash')
var Arrow = require('arrow')

exports.upsert = function upsert (Model, id, doc, callback) {
  var self = this
  var table = this.getTableName(Model)
  table = this.escapeKeys([table])[0]
  var payload = Model.instance(doc, false).toPayload()
  var primaryKeyColumn = this.getPrimaryKeyColumn(Model)
  var columns = this.fetchColumns(table, payload)
  var placeholders
  var query

  if (!id || !doc) {
    throw new Error('You must provide a Model id and data Object, that will be persisted')
  }

  self.findByID(Model, id, function (err, result) {
    if (err) {
      callback(err)
    } else if (result) {
      placeholders = columns.map(function (name) { return name + ' = ?' })

      query = 'UPDATE ' + table + ' SET ' + placeholders.join(',') + ' WHERE ' + primaryKeyColumn + ' = ?'
      if (!primaryKeyColumn) {
        return callback(new Arrow.ORMError('can\'t find primary key column for ' + table))
      }

      self._query(query, _.values(doc), callback, function (result) {
        var instance = Model.instance(doc, true)
        instance.setPrimaryKey(id)
        callback(null, instance)
      })
    } else {
      placeholders = columns.map(self.returnPlaceholder)
      if (!primaryKeyColumn) {
        query = 'INSERT INTO ' + table + ' (' + self.escapeKeys(columns).join(',') + ') VALUES (' + placeholders.join(',') + ')'
      } else {
        query = 'INSERT INTO ' + table + ' (' + primaryKeyColumn + ',' + self.escapeKeys(columns).join(',') + ') VALUES (' + id + ', ' + placeholders.join(',') + ')'
      }
      delete doc[primaryKeyColumn]
      self._query(query, _.values(doc), callback, function (result) {
        var instance = Model.instance(doc, true)
        instance.setPrimaryKey(id)
        callback(null, instance)
      })
    }
  })
}
