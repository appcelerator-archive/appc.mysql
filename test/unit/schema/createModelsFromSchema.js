'use strict'

const test = require('tap').test
const sinon = require('sinon')
const Arrow = require('arrow')

const createModelsFromSchema = require('../../../lib/schema/createModelsFromSchema').createModelsFromSchema

test('### Should create models from schema ###', function (t) {
  var mockConnector = {
    schema: {
      objects: require('../../schemaJSON.js'),
      primary_keys: {
        post: 'id'
      }
    },
    name: 'Test',
    models: [],
    config: {

    },
    convertDataTypeToJSType: sinon.spy()
  }

  const arrowModelExtendStub = sinon.stub(Arrow.Model, 'extend', sinon.spy())

  // Test call
  createModelsFromSchema.call(mockConnector)
  t.ok(arrowModelExtendStub.calledOnce)
  t.ok(mockConnector.convertDataTypeToJSType.called)
  arrowModelExtendStub.restore()
  t.end()
})
