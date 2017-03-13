const test = require('tap').test
const server = require('./../../server')
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

test('### fetchColumns - passing table argument ###', function (t) {
  CONNECTOR.schema = { objects: { Posts: null } }

  const table = 'Posts'
  const payload = {
    test: 'test'
  }

  const columns = CONNECTOR.fetchColumns(table, payload)
  t.ok(columns)
  t.ok(columns.length > 0)

  t.end()
})

test('### fetchColumns - without passing table argument ###', function (t) {
  CONNECTOR.schema = { objects: { Posts: 'test' } }
  const table = 'Posts'
  const payload = {
    test: 'test'
  }

  const columns = CONNECTOR.fetchColumns(table, payload)
  t.ok(columns)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
