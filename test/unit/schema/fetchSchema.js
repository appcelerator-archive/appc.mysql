const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const fetchSchemaMethod = require('../../../lib/schema/fetchSchema').fetchSchema

var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      CONNECTOR = ARROW.getConnector('appc.mysql')
      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Fetch Schema with existing schema ', function (t) {
  CONNECTOR.schema = {
    objects: {},
    database: 'test',
    primary_keys: {}
  }

  const next = function (errMessage, schema) {

  }

  const nextSpy = sinon.spy(next)

  fetchSchemaMethod.bind(CONNECTOR, nextSpy)()
  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.calledWith(null, CONNECTOR.schema))
  CONNECTOR.schema = null
  t.end()
})

test('### Fetch Schema without existing schema', function (t) {
  const next = function (errMessage, schema) {

  }
  const nextMethodSpy = sinon.spy(next)

  var test1 = {
    COLUMN_KEY: 'PRI'
  }
  var test2 = {
  }

  const _queryStub = sinon.stub(CONNECTOR, '_query', function (query, db, nextMethodSpy, executor) {
    executor([test1, test2])
  })
  fetchSchemaMethod.bind(CONNECTOR, nextMethodSpy)()
  t.ok(nextMethodSpy.calledOnce)
  t.ok(_queryStub.calledOnce)
  t.ok(_queryStub.calledWith('SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?', ['test'], nextMethodSpy))
  _queryStub.restore()
  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
