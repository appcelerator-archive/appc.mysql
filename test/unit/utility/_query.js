const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
var ARROW
var CONNECTOR

const errorMessage = new Error()
const data = 'STUBBED_DATA'
function cb (errorMessage, data) { };
const cbSpy = sinon.spy(cb)

function executor (results) { };
const executorSpy = sinon.spy(executor)

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

test('### _query - Error ###', testWrap(function (t) {
  const _queryStub = sinon.stub(CONNECTOR, 'getConnection').callsFake((callback) => {
    callback(errorMessage)
  })

  CONNECTOR._query({}, {}, cbSpy, executorSpy)
  t.ok(_queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errorMessage))

  cbSpy.resetHistory()
  _queryStub.restore()
  executorSpy.resetHistory()

  t.end()
}))

test('### query - Error ###', testWrap(function (t) {
  const connQuerySpy = sinon.spy()

  const _queryStub = sinon.stub(CONNECTOR, 'getConnection').callsFake((callback) => {
    callback(null, {
      query: (query, data, cb) => {
        connQuerySpy()
        cb(errorMessage)
      }
    })
  })

  CONNECTOR._query({}, {}, cbSpy, executorSpy)
  t.ok(_queryStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(connQuerySpy.calledOnce)
  t.ok(cbSpy.calledWith(errorMessage))

  cbSpy.resetHistory()
  _queryStub.restore()
  executorSpy.resetHistory()
  connQuerySpy.resetHistory()

  t.end()
}))

test('### query - Success ###', testWrap(function (t) {
  const connQuerySpy = sinon.spy()

  const _queryStub = sinon.stub(CONNECTOR, 'getConnection').callsFake((callback) => {
    callback(null, {
      query: (query, result, cb) => {
        connQuerySpy()
        cb(null, data)
      }
    })
  })

  CONNECTOR._query({}, {}, cbSpy, executorSpy)
  t.ok(_queryStub.calledOnce)
  t.ok(executorSpy.calledOnce)
  t.ok(connQuerySpy.calledOnce)
  t.ok(executorSpy.calledWith(data))

  cbSpy.resetHistory()
  _queryStub.restore()
  executorSpy.resetHistory()
  connQuerySpy.resetHistory()

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
