const test = require('tap').test
const getTableSchema = require('../../../lib/utility/getTableSchema').getTableSchema
const server = require('../../server')
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

test('### getTableSchema ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')

  CONNECTOR.schema = { objects: { Posts: 'success' } }

  const tableNameStub = sinon.stub(CONNECTOR, 'getTableName').callsFake((Model) => { return 'Posts' })

  getTableSchema.bind(CONNECTOR, Model)()

  t.ok(tableNameStub.calledOnce)

  tableNameStub.restore()

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
