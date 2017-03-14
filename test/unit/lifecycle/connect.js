const test = require('tap').test
const sinon = require('sinon')
const connectMethod = require('../../../lib/lifecycle/connect')['connect']

test('### Test Connect method with connection pooling set to true error case no error code ###', sinon.test(function (t) {
    // Stubs & spies
  const context = {
    config: {
      connection_pooling: true
    }
  }

  const err = new Error()
  function getConnection (cb) {
    cb(err)
  }

  const getConnectionSpy = this.spy(getConnection)

  const mysql = require('../../../node_modules/mysql')

  var createPoolStub = this.stub(mysql, 'createPool', function (config) {
    return {
      getConnection: getConnectionSpy
    }
  })

  function next (errParameter) { }
  const nextSpy = this.spy(next)

    // Execution
  connectMethod.bind(context, nextSpy)()

    // Test
  t.ok(createPoolStub.calledOnce)
  t.ok(createPoolStub.calledWithExactly(context.config))
  t.ok(getConnectionSpy.calledOnce)
  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.calledWithExactly(err))

  t.end()
}))

test('### Test Connect method with connection pooling set to true error case with error code ###', sinon.test(function (t) {
    // Stubs & spies
  const context = {
    config: {
      connection_pooling: true
    }
  }

  const err = new Error()
  err.code = 'ECONNREFUSED'

  function getConnection (cb) {
    cb(err)
  }
  const getConnectionSpy = this.spy(getConnection)

  const mysql = require('../../../node_modules/mysql')

  var createPoolStub = this.stub(mysql, 'createPool', function (config) {
    return {
      getConnection: getConnectionSpy
    }
  })

  function next (errParameter) { }
  const nextSpy = this.spy(next)

    // Execution
  connectMethod.bind(context, nextSpy)()

  const expectedErrorMessage = 'Connecting to your MySQL server failed; either it isn\'t running, or your connection details are invalid.'

    // Test
  t.ok(createPoolStub.calledOnce)
  t.ok(createPoolStub.calledWithExactly(context.config))
  t.ok(getConnectionSpy.calledOnce)
  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.calledWithExactly(err))
  t.ok(err.message === expectedErrorMessage)

  t.end()
}))

test('### Test Connect method with connection pooling set to true ###', sinon.test(function (t) {
    // Stubs & spies
  const context = {
    config: {
      connection_pooling: true
    }
  }

  function release () { }
  const releaseSpy = this.spy(release)
  const connection = {
    release: releaseSpy
  }

  function getConnection (cb) {
    cb(null, connection)
  }
  const getConnectionSpy = this.spy(getConnection)

  const mysql = require('../../../node_modules/mysql')

  var createPoolStub = this.stub(mysql, 'createPool', function (config) {
    return {
      getConnection: getConnectionSpy
    }
  })

  function next () { }
  const nextSpy = this.spy(next)

    // Execution
  connectMethod.bind(context, nextSpy)()

    // Test
  t.ok(createPoolStub.calledOnce)
  t.ok(createPoolStub.calledWithExactly(context.config))
  t.ok(getConnectionSpy.calledOnce)
  t.ok(releaseSpy.calledOnce)
  t.ok(releaseSpy.args[0].length === 0)
  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.args[0].length === 0)

  t.end()
}))

test('### Test Connect method with connection pooling set to false ###', sinon.test(function (t) {
    // Stubs & spies
  const context = {
    config: {
      connection_pooling: false
    }
  }

  function connect () { }
  const connectSpy = this.spy(connect)

  const mysql = require('../../../node_modules/mysql')
  const createConnectionStub = this.stub(mysql, 'createConnection', function (config) {
    return {
      connect: connectSpy
    }
  })

  function next () { }

    // Execution
  connectMethod.bind(context, next)()

    // Test
  t.ok(createConnectionStub.calledOnce)
  t.ok(createConnectionStub.calledWithExactly(context.config))
  t.ok(connectSpy.calledOnce)

  t.end()
}))
