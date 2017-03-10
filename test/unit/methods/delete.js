const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const deleteMethod = require('../../../lib/methods/delete')['delete']

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

test('### Delete Call Not Ok ###', function (t) {
  function getTableName (model) {
    return 'Post'
  }

  function getPrimaryKeyColumn (model) {
    return 'id'
  }

  var executor = function (result) {
    callback()
  }
  function _queryStub (query, data, callback, executor) {
    executor(instance)
  }

  const model = ARROW.getModel('Posts')

  var tableNameStub = sinon.stub(CONNECTOR, 'getTableName', getTableName)
  var primaryKeyStub = sinon.stub(CONNECTOR, 'getPrimaryKeyColumn', getPrimaryKeyColumn)
  var queryStub = sinon.stub(CONNECTOR, '_query', _queryStub)
  var err = 'error'
  function cb () {

  }
  const cbSpy = sinon.spy(cb)
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }
  var instance = model.instance(test, false)

  deleteMethod.bind(CONNECTOR, model, instance, cbSpy)()
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith('DELETE FROM Post WHERE id = ?', undefined, cbSpy))
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(primaryKeyStub.calledOnce)
  t.ok(primaryKeyStub.calledWith(model))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWithExactly())
  queryStub.restore()
  tableNameStub.restore()
  primaryKeyStub.restore()
  t.end()
})

test('### Delete Call Ok ###', function (t) {
  const model = ARROW.getModel('Posts')
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }
  var instance = model.instance(test, false)

  function cb (err, data) { }
  const cbSpy = sinon.spy(cb)
  const executor = function (result) {
    callback(null, instance)
  }
  function getTableName (model) {
    return 'Post'
  }

  function getPrimaryKeyColumn (model) {
    return 'id'
  }

  function _queryStub (query, data, callback, executor) {
    executor({ affectedRows: 1 })
  }

  var tableNameStub = sinon.stub(CONNECTOR, 'getTableName', getTableName)
  var primaryKeyStub = sinon.stub(CONNECTOR, 'getPrimaryKeyColumn', getPrimaryKeyColumn)
  var queryStub = sinon.stub(CONNECTOR, '_query', _queryStub)

  deleteMethod.bind(CONNECTOR, model, instance, cbSpy)()
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith('DELETE FROM Post WHERE id = ?', undefined, cbSpy))
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(primaryKeyStub.calledOnce)
  t.ok(primaryKeyStub.calledWith(model))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, instance))
  queryStub.restore()
  tableNameStub.restore()
  primaryKeyStub.restore()
  t.end()
})

test('### Delete Call without primary key ###', function (t) {
  function getTableName (model) {
    return 'Post'
  }

  function getPrimaryKeyColumn (model) {
    return false
  }

  const model = ARROW.getModel('Posts')

  var tableNameStub = sinon.stub(CONNECTOR, 'getTableName', getTableName)
  var primaryKeyStub = sinon.stub(CONNECTOR, 'getPrimaryKeyColumn', getPrimaryKeyColumn)

  const errorMessage = new Error()
  function cbError (errorMessage) { }
  const cbErrorSpy = sinon.spy(cbError)

  var test = {
    title: 'test',
    content: 'test',
    books: []
  }
  var instance = model.instance(test, false)

  deleteMethod.bind(CONNECTOR, model, instance, cbErrorSpy)()

  t.ok(tableNameStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(cbErrorSpy.calledOnce)
  tableNameStub.restore()
  primaryKeyStub.restore()
  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
