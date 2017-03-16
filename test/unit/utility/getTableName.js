const test = require('tap').test
const getTableName = require('../../../lib/utility/getTableName').getTableName
const server = require('../../server')
var ARROW

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### getTableName ###', function (t) {
  const Model = ARROW.getModel('Posts')

  const name = getTableName(Model)

  t.equals(name, 'Posts')

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
