const test = require('tap').test
const sinon = require('sinon')
const server = require('../../server')
var ARROW
var CONNECTOR

const where = {
  likeWhere: { $like: 'post' },
  ltWhere: { $lt: 5 },
  lteWhere: { $lte: 5 },
  gtWhere: { $gt: 5 },
  gteWhere: { $gte: 5 },
  neWhere: { $ne: 'test' }
}

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

test('### translateWhereToQuery ###', function (t) {
  const values = []
  const translateWhereToQuerySpy = sinon.spy(CONNECTOR, 'translateWhereToQuery')

  CONNECTOR.translateWhereToQuery(where, values)

  t.ok(translateWhereToQuerySpy.calledOnce)
  t.ok(translateWhereToQuerySpy.returnValues)
  t.equals(typeof translateWhereToQuerySpy.returnValues[0], 'string')

  translateWhereToQuerySpy.reset()

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
