const test = require('tap').test
const server = require('../../server')
const findAllMethod = require('./../../../lib/methods/findAll').findAll
const sinon = require('sinon')
const arrow = require('arrow')
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

test('### Test findAll Method ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(
    CONNECTOR,
    'getTableName',
    (Model) => {
      return 'test'
    }
  )

  const getPrimaryKeyColumnStub = this.stub(
    CONNECTOR,
    'getPrimaryKeyColumn',
    (Model) => {
      return true
    }
  )

  const escapeKeysStub = this.stub(
    CONNECTOR,
    'escapeKeys',
    (Model) => {
      return ["'title'", "'content'"]
    }
  )

  const getInstanceFromRowStub = this.stub(
    CONNECTOR,
    'getInstanceFromRow',
    (Model) => {
      return 'data'
    }
  )

  const ArrowCollectionMock = (function () {
    function ArrowCollectionMock () { }
    return ArrowCollectionMock
  })()

  const arrowCollectionSpy = this.spy(function () {
    return sinon.createStubInstance(ArrowCollectionMock)
  })

  this.stub(arrow, 'Collection', arrowCollectionSpy)

  const queryStub = this.stub(
    CONNECTOR,
    '_query',
    (query, callback, executor) => {
      executor([1, 2, 3])
    }
  )

  findAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(tableNameStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(escapeKeysStub.called)
  t.ok(getInstanceFromRowStub.calledWith(Model))
  t.ok(queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.end()
}))

test('### Test findAll Method - primaryKey column ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(
    CONNECTOR,
    'getTableName',
    (Model) => {
      return 'test'
    }
  )

  const getPrimaryKeyColumnStub = this.stub(
    CONNECTOR,
    'getPrimaryKeyColumn',
    (Model) => {
      return false
    }
  )

  const escapeKeysStub = this.stub(
    CONNECTOR,
    'escapeKeys',
    (Model) => {
      return ["'title'", "'content'"]
    }
  )

  const getInstanceFromRowStub = this.stub(
    CONNECTOR,
    'getInstanceFromRow',
    (Model) => {
      return 'data'
    }
  )

  const ArrowCollectionMock = (function () {
    function ArrowCollectionMock () { }
    return ArrowCollectionMock
  })()

  const arrowCollectionSpy = this.spy(function () {
    return sinon.createStubInstance(ArrowCollectionMock)
  })

  this.stub(arrow, 'Collection', arrowCollectionSpy)

  const queryStub = this.stub(
    CONNECTOR,
    '_query',
    (query, callback, executor) => {
      executor([1, 2, 3])
    }
  )

  findAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(tableNameStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(escapeKeysStub.called)
  t.ok(getInstanceFromRowStub.calledWith(Model))
  t.ok(queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
