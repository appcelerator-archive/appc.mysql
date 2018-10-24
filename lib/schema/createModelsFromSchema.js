var Arrow = require('arrow')
var _ = require('lodash')
/**
 * Creates models from your schema (see "fetchSchema" for more information on the schema).
 */
exports.createModelsFromSchema = function () {
  var self = this
  var models = {}

  /**
*Returns model's primary key column's name
*@param {string} modelName
*@returns {string}
*/
  function getPrimaryKeyFromSchema (modelName) {
    return self.schema.primary_keys[modelName]
  }

  /**
* Get model fields except the primaryKey field
* @param {string} modelName
* @param {Object} modelSchema
* @returns {Object}
*/
  function getFieldsExceptPrimaryKey (modelName, modelSchema) {
    return Object.keys(modelSchema)
      .filter(function (fieldName) {
        var primaryKeyColumnName = getPrimaryKeyFromSchema(modelName)

        if ((typeof primaryKeyColumnName !== 'undefined' && fieldName === primaryKeyColumnName) || fieldName === 'id') {
          return false
        }
        return true
      })
      .reduce(function (fields, fieldName) {
        fields[fieldName] = {
          type: self.convertDataTypeToJSType(modelSchema[fieldName].DATA_TYPE),
          required: modelSchema.IS_NULLABLE === 'NO'
        }

        return fields
      }, {})
  }

  /**
* Generate Arrow Model base on model name and fields
* @param {string} modelName
* @param {Object} fields
* @returns {Object}
*/
  function generateModel (modelName, fields) {
    var primaryKeyColumnName = getPrimaryKeyFromSchema(modelName)

    var modelInfo = {
      name: self.name + '/' + modelName,
      autogen: !!self.config.modelAutogen,
      fields: fields,
      connector: self,
      generated: true,
      disabledActions: ['findAndModify']
    }

    if (typeof primaryKeyColumnName !== 'undefined') {
      modelInfo.metadata = {
        primarykey: primaryKeyColumnName
      }
    }

    return Arrow.Model.extend(self.name + '/' + modelName, modelInfo)
  }

  // Generate models based on schema objects
  Object.keys(self.schema.objects).forEach(function (modelName) {
    var object = self.schema.objects[modelName]

    var fields = getFieldsExceptPrimaryKey(modelName, object)
    models[self.name + '/' + modelName] = generateModel(modelName, fields)
  })

  self.models = _.defaults(self.models || {}, models)
}
