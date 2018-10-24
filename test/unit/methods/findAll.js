const test = require('tap').test
const server = require('../../server')
const findAllMethod = require('./../../../lib/methods/findAll').findAll
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
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

test('### Test findAll Method ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(CONNECTOR, 'getTableName').callsFake((Model) => {
    return 'test'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake((Model) => {
    return true
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys').callsFake((Model) => {
    return ["'title'", "'content'"]
  })

  const getInstanceFromRowStub = this.stub(CONNECTOR, 'getInstanceFromRow').callsFake((Model) => {
    return 'data'
  })

  const ArrowCollectionMock = (function () {
    function ArrowCollectionMock () { }
    return ArrowCollectionMock
  })()

  const arrowCollectionSpy = this.spy(function () {
    return sinon.createStubInstance(ArrowCollectionMock)
  })

  this.stub(arrow, 'Collection').callsFake(arrowCollectionSpy)

  const queryStub = this.stub(CONNECTOR, '_query').callsFake((query, callback, executor) => {
    executor([1, 2, 3])
  })

  findAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(tableNameStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(escapeKeysStub.called)
  t.ok(getInstanceFromRowStub.calledWith(Model))
  t.ok(queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.end()
}))

test('### Test findAll Method - primaryKey column ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(CONNECTOR, 'getTableName').callsFake((Model) => {
    return 'test'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake((Model) => {
    return false
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys').callsFake((Model) => {
    return ["'title'", "'content'"]
  })

  const getInstanceFromRowStub = this.stub(CONNECTOR, 'getInstanceFromRow').callsFake((Model) => {
    return 'data'
  })

  const ArrowCollectionMock = (function () {
    function ArrowCollectionMock () { }
    return ArrowCollectionMock
  })()

  const arrowCollectionSpy = this.spy(function () {
    return sinon.createStubInstance(ArrowCollectionMock)
  })

  this.stub(arrow, 'Collection').callsFake(arrowCollectionSpy)

  const queryStub = this.stub(CONNECTOR, '_query').callsFake((query, callback, executor) => {
    executor([1, 2, 3])
  })

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
