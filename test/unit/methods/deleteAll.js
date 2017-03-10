const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const deleteAllMethod = require('../../../lib/methods/deleteAll').deleteAll

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

test('### DeleteAll Call with no result###', function (t) {
  function getTableName (model) {
    return 'Post'
  }

  var executor = function (result) {
    callback()
  }

  function _queryStub (query, callback, executor) {
    executor(undefined)
  }

  const model = ARROW.getModel('Posts')

  var tableNameStub = sinon.stub(CONNECTOR, 'getTableName', getTableName)
  var queryStub = sinon.stub(CONNECTOR, '_query', _queryStub)
  function cb (err, instance) {

  }
  const cbSpy = sinon.spy(cb)
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }
  var instance = model.instance(test, false)

  deleteAllMethod.bind(CONNECTOR, model, cbSpy)()
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith('DELETE FROM Post', cbSpy))
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, 0))
  queryStub.restore()
  tableNameStub.restore()
  t.end()
})

test('### DeleteAll Call Ok###', function (t) {
  function getTableName (model) {
    return 'Post'
  }

  var executor = function (result) {
    callback()
  }

  function _queryStub (query, callback, executor) {
    executor({ affectedRows: 1 })
  }

  const model = ARROW.getModel('Posts')

  var tableNameStub = sinon.stub(CONNECTOR, 'getTableName', getTableName)
  var queryStub = sinon.stub(CONNECTOR, '_query', _queryStub)
  function cb (err, instance) {

  }
  const cbSpy = sinon.spy(cb)
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }
  var instance = model.instance(test, false)

  deleteAllMethod.bind(CONNECTOR, model, cbSpy)()
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith('DELETE FROM Post', cbSpy))
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, 1))
  queryStub.restore()
  tableNameStub.restore()
  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
