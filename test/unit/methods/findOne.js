const test = require('tap').test
const server = require('./../../server.js')
const findOneMethod = require('../../../lib/methods/findOne').findOne
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

test('FindOne with console.warn', sinon.test(function (t) {
  const logger = CONNECTOR.logger

  const findByIdStub = this.stub(
    CONNECTOR.findByID,
    'apply',
    (values) => { }
  )
  CONNECTOR.logger = false

  // Execution
  findOneMethod.bind(CONNECTOR)()

  t.ok(findByIdStub.calledOnce)

  CONNECTOR.logger = logger
  t.end()
}))

test('FindOne with logger', sinon.test(function (t) {
  const findByIdStub = this.stub(
    CONNECTOR.findByID,
    'apply',
    (values) => { }
  )

  const loggerStub = this.stub(CONNECTOR.logger,
    'warn',
    (CONNECTOR) => { }
  )

  // Execution
  findOneMethod.bind(CONNECTOR)()
  t.ok(loggerStub.calledOnce)
  t.ok(findByIdStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
