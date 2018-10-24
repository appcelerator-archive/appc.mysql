const test = require('tap').test
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

test('### getPrimaryKeyColumn ###', function (t) {
  const Model = ARROW.getModel('Posts')

  const pk = CONNECTOR.getPrimaryKeyColumn(Model)

  t.equals(Model.metadata.primarykey, pk)

  t.end()
})

test('### getPrimaryKeyColumn ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')

  const pk = Model.metadata.primarykey
  Model.metadata.primarykey = undefined

  const tableNameStub = sinon.stub(CONNECTOR, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })

  const getTableSchemaStub = sinon.stub(CONNECTOR, 'getTableSchema').callsFake((Model) => {
    return { id: { COLUMN_NAME: 'id' } }
  })

  CONNECTOR.metadata.schema = { primary_keys: { Posts: 'id' } }

  const primaryKeyColumnName = CONNECTOR.getPrimaryKeyColumn(Model)

  t.equals(primaryKeyColumnName, 'id')
  t.ok(tableNameStub.calledWith(Model))
  t.ok(tableNameStub.calledOnce)
  t.ok(getTableSchemaStub.calledWith(Model))
  t.ok(getTableSchemaStub.calledOnce)

  Model.metadata.primarykey = pk

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
