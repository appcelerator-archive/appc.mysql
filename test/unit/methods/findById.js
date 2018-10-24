const test = require('tap').test
const server = require('./../../server.js')
const findByIdMethod = require('../../../lib/methods/findByID').findByID
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
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

test('FindByID without primary key', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  function cbError (errorMessage) { }
  const cbErrorSpy = this.spy(cbError)

  const tableStub = this.stub(CONNECTOR, 'getTableName').callsFake((Model) => {
    return 'post'
  })

  const primaryKeyStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake((Model) => {
    return false
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys').callsFake((Model) => {
    return ['title', 'name']
  })

  findByIdMethod.bind(CONNECTOR, Model, 'id', cbErrorSpy)()

  t.ok(primaryKeyStub.calledOnce)
  t.ok(tableStub.calledOnce)
  t.ok(escapeKeysStub.called)
  t.ok(cbErrorSpy.calledOnce)

  t.end()
}))

test('FindByID empty', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb () { }
  const cbSpy = this.spy(cb)

  const tableStub = this.stub(CONNECTOR, 'getTableName').callsFake((Model) => {
    return 'post'
  })

  const primaryKeyStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake((Model) => {
    return true
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys').callsFake((Model) => {
    return ['title', 'name']
  })

  const queryStub = this.stub(CONNECTOR, '_query').callsFake((query, id, callback, rows) => {
    rows()
  })

  findByIdMethod.bind(CONNECTOR, Model, 'id', cbSpy)()

  t.ok(primaryKeyStub.calledOnce)
  t.ok(tableStub.calledOnce)
  t.ok(escapeKeysStub.called)
  t.ok(queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('FindByID response', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableStub = this.stub(CONNECTOR, 'getTableName').callsFake((Model) => {
    return 'post'
  })

  const primaryKeyStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake((Model) => {
    return true
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys').callsFake((Model) => {
    return ['title', 'name']
  })

  const getInstanceFromRowStub = this.stub(CONNECTOR, 'getInstanceFromRow').callsFake((Model, rows) => {
    return 'data'
  })

  const queryStub = this.stub(CONNECTOR, '_query').callsFake((query, id, callback, rows) => {
    rows('valid')
  })

  findByIdMethod.bind(CONNECTOR, Model, 'id', cbSpy)()

  t.ok(primaryKeyStub.calledOnce)
  t.ok(tableStub.calledOnce)
  t.ok(escapeKeysStub.called)
  t.ok(queryStub.calledOnce)
  t.ok(getInstanceFromRowStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, 'data'))

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
