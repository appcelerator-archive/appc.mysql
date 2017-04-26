const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const arrow = require('arrow')
const queryMethod = require('../../../lib/methods/query').query

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

test('### Query Call with no results ###', function (t) {
  const model = ARROW.getModel('Posts')

  const tableNameStub = sinon.stub(CONNECTOR, 'getTableName', function (model) {
    return 'Post'
  })

  const primaryKeyStub = sinon.stub(CONNECTOR, 'getPrimaryKeyColumn', function (model) {
    return 1
  })

  const escapeKeysStub = sinon.stub(CONNECTOR, 'escapeKeys', function (keys) {
    return keys
  })

  const translateWhereToQueryStub = sinon.stub(CONNECTOR, 'translateWhereToQuery', function (where, values) {

  })

  const _queryStub = sinon.stub(CONNECTOR, '_query', function (query, data, callback, executor) {
    executor()
  })

  function cb () { }
  const cbSpy = sinon.spy(cb)
  var options = {}
  queryMethod.bind(CONNECTOR, model, options, cbSpy)()
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(primaryKeyStub.calledOnce)
  t.ok(primaryKeyStub.calledWith(model))
  t.ok(_queryStub.calledOnce)
  t.ok(_queryStub.calledWith('SELECT * FROM Post', [], cbSpy))
  tableNameStub.restore()
  primaryKeyStub.restore()
  escapeKeysStub.restore()
  translateWhereToQueryStub.restore()
  _queryStub.restore()

  t.end()
})

test('### Query Call with results ###', function (t) {
  const model = ARROW.getModel('Posts')
  const tableNameStub = sinon.stub(CONNECTOR, 'getTableName', function (model) {
    return 'Post'
  })

  const primaryKeyStub = sinon.stub(CONNECTOR, 'getPrimaryKeyColumn', function (model) {
    return 'id'
  })

  const escapeKeysStub = sinon.stub(CONNECTOR, 'escapeKeys', function (keys) {
    return keys
  })

  const translateWhereToQueryStub = sinon.stub(CONNECTOR, 'translateWhereToQuery', function (where, values) {
    values.push({ title: 'test' })
    return ' WHERE $eq = ?'
  })

  const ArrowCollectionMock = (function () {
    function ArrowCollectionMock () { }
    return ArrowCollectionMock
  })()

  const arrowCollectionSpy = sinon.spy(function () {
    return sinon.createStubInstance(ArrowCollectionMock)
  })

  sinon.stub(arrow, 'Collection', arrowCollectionSpy)

  const _queryStub = sinon.stub(CONNECTOR, '_query', function (query, data, callback, executor) {
    executor([test, test1])
  })

  var test = {
    title: 'test',
    content: 'test',
    books: []
  }

  var test1 = {
    title: 'test1',
    content: 'test1',
    books: []
  }

  var instance = model.instance(test, false)

  const getInstanceFromRowStub = sinon.stub(CONNECTOR, 'getInstanceFromRow', function (model, row) {
    return instance
  })

  function cb () { }
  const cbSpy = sinon.spy(cb)
  var options = {
    sel: { 'all': ['title'] },
    limit: 10,
    page: 1,
    per_page: 10,
    order: 'content',
    skip: 1,
    where: { '$eq': { title: 'test' } }
  }
  queryMethod.bind(CONNECTOR, model, options, cbSpy)()
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(primaryKeyStub.calledOnce)
  t.ok(primaryKeyStub.calledWith(model))
  t.ok(translateWhereToQueryStub.calledOnce)
  t.ok(_queryStub.calledOnce)
  t.ok(_queryStub.calledWith('SELECT id, all FROM Post WHERE $eq = ? ORDER BY content ASC LIMIT 10 OFFSET 1', [ { title: 'test' } ], cbSpy))
  t.ok(arrowCollectionSpy.calledOnce)

  getInstanceFromRowStub.restore()
  tableNameStub.restore()
  primaryKeyStub.restore()
  escapeKeysStub.restore()
  translateWhereToQueryStub.restore()
  _queryStub.restore()

  t.end()
})

test('### Query Call with different query and no results  ###', function (t) {
  const model = ARROW.getModel('Posts')

  const tableNameStub = sinon.stub(CONNECTOR, 'getTableName', function (model) {
    return 'Post'
  })

  const primaryKeyStub = sinon.stub(CONNECTOR, 'getPrimaryKeyColumn', function (model) {
    return 'id'
  })

  const escapeKeysStub = sinon.stub(CONNECTOR, 'escapeKeys', function (keys) {
    return keys
  })

  const _queryStub = sinon.stub(CONNECTOR, '_query', function (query, data, callback, executor) {
    executor()
  })

  const getTableSchemaStub = sinon.stub(CONNECTOR, 'getTableSchema', function (model) {

  })

  function cb () { }
  const cbSpy = sinon.spy(cb)
  var options = {
    unsel: { 'all': ['books'] },
    limit: 10,
    page: 1,
    per_page: 10,
    order: { 'content': 'name' }
  }
  queryMethod.bind(CONNECTOR, model, options, cbSpy)()
  t.ok(tableNameStub.calledOnce)
  t.ok(tableNameStub.calledWith(model))
  t.ok(primaryKeyStub.calledOnce)
  t.ok(primaryKeyStub.calledWith(model))
  t.ok(escapeKeysStub.called)
  t.ok(escapeKeysStub.calledWith([]))
  t.ok(_queryStub.calledOnce)
  t.ok(_queryStub.calledWith('SELECT id,  FROM Post ORDER BY content DESC LIMIT 10', [], cbSpy))
  t.ok(cbSpy.calledOnce)
  t.ok(getTableSchemaStub.calledOnce)

  tableNameStub.restore()
  primaryKeyStub.restore()
  escapeKeysStub.restore()
  _queryStub.restore()
  getTableSchemaStub.restore()

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
