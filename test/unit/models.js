const test = require('tap').test
const server = require('./../server')
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

test('### Test Model Post ###', function (t) {
  const Model = ARROW.getModel('Posts')

  t.equal(typeof Model, 'object')
  t.equal(Model.fields.title.type, 'string', 'title should be string')
  t.equal(Model.fields.content.type, 'string', 'content should be string')
  t.equal(Model.fields.books.type, 'array', 'books should be array')

  t.end()
})

test('### Test Model Book ###', function (t) {
  const Model = ARROW.getModel('Books')

  t.equal(typeof Model, 'object')
  t.equal(Model.fields.CategoryId.type, 'string', 'CategoryId should be string')
  t.equal(Model.fields.Discounted.type, 'boolean', 'Discounted should be string')
  t.equal(Model.fields.QuantityPerUnit.type, 'string', 'QuantityPerUnit should be string')
  t.equal(Model.fields.UnitPrice.type, 'number', 'UnitPrice should be number')
  t.equal(Model.fields.Post.type, 'string', 'Post should be string')

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
