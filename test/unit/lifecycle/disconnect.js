const test = require('tap').test
const sinon = require('sinon')
const disconnectMethod = require('../../../lib/lifecycle/disconnect')['disconnect']

test('### Test Disconnect method with connection pooling set to true ###', sinon.test(function (t) {
  function next () { }
  const nextSpy = this.spy(next)

  function end (func) {
    func()
  }
  const endSpy = this.spy(end)

  const context = {
    pool: {
      end: endSpy
    }
  }

    // Execution
  disconnectMethod.bind(context, nextSpy)()

    // Test
  t.ok(endSpy.calledOnce)
  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.args[0].length === 0)

  t.end()
}))

test('### Test Disconnect method with connection pooling set to false ###', sinon.test(function (t) {
  function next () { }
  const nextSpy = this.spy(next)

  const context = { }

    // Execution
  disconnectMethod.bind(context, nextSpy)()

    // Test
  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.args[0].length === 0)

  t.end()
}))
