const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
var ARROW
var CONNECTOR

const errorMessage = new Error()
const data = 'STUBBED_DATA'
function cb (errorMessage, data) { };
const cbSpy = sinon.spy(cb)

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      CONNECTOR = ARROW.getConnector('appc.mysql')
      CONNECTOR.pool = {
        getConnection: (callback) => { }
      }
      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### getConnection - Error case ###', sinon.test(function (t) {
  const connectionStub = sinon.stub(
    CONNECTOR.pool,
    'getConnection',
    (callback) => {
      callback(errorMessage)
    }
  )

  CONNECTOR.getConnection(cbSpy)
  t.ok(connectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errorMessage))

  connectionStub.restore()
  cbSpy.reset()

  t.end()
}))

test('### getConnection - Success case ###', sinon.test(function (t) {
  const connectionStub = this.stub(
    CONNECTOR.pool,
    'getConnection',
    (callback) => {
      callback(null, data)
    }
  )

  CONNECTOR.getConnection(cbSpy)
  t.ok(connectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, data))

  connectionStub.restore()
  cbSpy.reset()

  t.end()
}))

test('### connector.getConnection - Success case ###', sinon.test(function (t) {
  const origPool = CONNECTOR.pool
  CONNECTOR.pool = null

  CONNECTOR.getConnection(cbSpy)
  t.ok(cbSpy.calledOnce)

  CONNECTOR.pool = origPool

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
