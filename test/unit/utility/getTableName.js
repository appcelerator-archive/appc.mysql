const test = require('tap').test
const getTableName = require('../../../lib/utility/getTableName').getTableName
const server = require('../../server')
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

test('### getTableName ###', function (t) {
  const Model = ARROW.getModel('Posts')

  const name = getTableName.bind(CONNECTOR, Model)()

  t.type(name, 'string')

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
