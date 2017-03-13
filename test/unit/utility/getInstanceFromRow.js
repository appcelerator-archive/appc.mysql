const test = require('tap').test
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

test('### getInstanceFromRow ###', function (t) {
  const Model = ARROW.getModel('Posts')

  const row = {
    id: '1',
    title: 'newTitle',
    content: 'newContent'
  }

  const instance = CONNECTOR.getInstanceFromRow(Model, row)

  t.equals(instance.content, row.content)
  t.equals(instance.title, row.title)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
