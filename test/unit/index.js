const test = require('tap').test
const server = require('../server')
const sinon = require('sinon')
const index = require('../../lib/index')['create']
const semver = require('semver')
var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
        .then((inst) => {
          ARROW = inst
          CONNECTOR = ARROW.getConnector('appc.mysql')
          ARROW.Connector = CONNECTOR
          ARROW.Connector.Capabilities = {}

          t.ok(ARROW, 'Arrow has been started')
          t.end()
        })
        .catch((err) => {
          t.threw(err)
        })
})

test('### Test Index.js Error Case ###', sinon.test(function (t) {
  const semverLtStub = this.stub(semver, 'lt', function (actualVersion, desiredVersion) {
    return true
  })

  t.throws(index.bind(CONNECTOR, ARROW),
        'This connector requires at least version 1.2.53 of Arrow please run `appc use latest`.')

  t.ok(semverLtStub.calledOnce)
  t.end()
}))

test('### Test Index.js Valid case ###', sinon.test(function (t) {
  const semverLtStub = this.stub(semver, 'lt', function (actualVersion, desiredVersion) { return false })

  const extendSpy = this.spy(function () { })

  ARROW.Connector.extend = extendSpy

  index.bind(CONNECTOR, ARROW)()

  t.ok(semverLtStub.calledOnce)
  t.ok(extendSpy.calledOnce)
  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
