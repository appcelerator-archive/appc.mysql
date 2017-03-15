const test = require('tap').test
const server = require('../../server')
const distinctMethod = require('./../../../lib/methods/distinct').distinct
const sinon = require('sinon')
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

test('### Distinct method response ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(
    CONNECTOR,
    'getTableName',
    (Model) => {
      return 'post'
    }
  )

  const queryStub = this.stub(
    CONNECTOR,
    '_query',
    (query, values, callback, executor) => {
      executor([1, 2, 3])
    }
  )

  distinctMethod.bind(CONNECTOR, Model, 'post', {}, cbSpy)()

  t.ok(tableNameStub.calledOnce)
  t.ok(queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Distinct method not unique records ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(
    CONNECTOR,
    'getTableName',
    (Model) => {
      return 'post'
    }
  )

  const queryStub = this.stub(
    CONNECTOR,
    '_query',
    (query, values, callback, executor) => {
      executor(undefined)
    }
  )

  distinctMethod.bind(CONNECTOR, Model, 'post', {}, cbSpy)()

  t.ok(queryStub.calledOnce)
  t.ok(tableNameStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Distinct method with where clause ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const tableNameStub = this.stub(
    CONNECTOR,
    'getTableName',
    (Model) => {
      return 'post'
    }
  )

  const translateWhereToQueryStub = this.stub(
    CONNECTOR,
    'translateWhereToQuery',
    (where, values) => {
      return { '$eq': 'Test' }
    }
  )

  const queryStub = this.stub(
    CONNECTOR,
    '_query',
    (query, values, callback, executor) => {
      executor(undefined)
    }
  )

  const options = {
    where: {
      Name: { '$eq': 'Test' }
    }
  }

  distinctMethod.bind(CONNECTOR, Model, 'post', options, cbSpy)()

  t.ok(tableNameStub.calledOnce)
  t.ok(queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(translateWhereToQueryStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
