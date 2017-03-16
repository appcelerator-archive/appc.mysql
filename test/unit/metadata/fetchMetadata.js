const test = require('tap').test
const server = require('../../server')
const fetchMetadataMethod = require('./../../../lib/metadata/fetchMetadata').fetchMetadata
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

test('### fetchMetadata test response, filends name and type ###', sinon.test(function (t) {
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  fetchMetadataMethod.bind(CONNECTOR, cbSpy)()
  const fields = cbSpy.args[0][1].fields

  t.equal(fields[0].name, 'connectionPooling')
  t.equal(fields[0].type, 'checkbox')

  t.equal(fields[1].name, 'connectionLimit')
  t.equal(fields[1].type, 'text')

  t.equal(fields[2].name, 'host')
  t.equal(fields[2].type, 'text')

  t.equal(fields[3].name, 'port')
  t.equal(fields[3].type, 'text')

  t.equal(fields[4].name, 'user')
  t.equal(fields[4].type, 'text')

  t.equal(fields[5].name, 'password')
  t.equal(fields[5].type, 'text')

  t.equal(fields[6].name, 'generateModelsFromSchema')
  t.equal(fields[6].type, 'checkbox')

  t.equal(fields[7].name, 'modelAutogen')
  t.equal(fields[7].type, 'checkbox')

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
