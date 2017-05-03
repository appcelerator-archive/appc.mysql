const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const saveMethod = require('../../../lib/methods/save')['save']
const lodash = require('lodash')
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

test('### Test Save Error Case ###', sinon.test(function (t) {
    // Data
  const Model = ARROW.getModel('Posts')
  const instance = {
    toPayload: function () {
      return ['Some Title', 'Some Content']
    },
    getPrimaryKey: function () {
      return '7'
    }
  }

    // Stubs & spies
  const getTableNameStub = this.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'post'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn', function (Model) {
    return undefined
  })

  const escapeKeysSpy = this.spy(CONNECTOR, 'escapeKeys')

  const fetchColumnsStub = this.stub(CONNECTOR, 'fetchColumns', function (table, paylod) {
    var result = []
    result.push('title')
    result.push('content')
    return result
  })

  function cb () { }

  const cbSpy = this.spy(cb)

    // Execution
  saveMethod.bind(CONNECTOR, Model, instance, cbSpy)()

    // Test
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(fetchColumnsStub.calledWith('post', ['Some Title', 'Some Content']))
  t.ok(escapeKeysSpy.called)
  t.ok(escapeKeysSpy.calledWith(['title', 'content']))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.args[0] !== null)
  var error = cbSpy.args[0][0]
  t.ok(error.message === "can't find primary key column for post")

  t.end()
}))

test('### Test Save Valid Data ###', sinon.test(function (t) {
    // Data
  const Model = ARROW.getModel('Posts')
  const instance = {
    toPayload: function () {
      return ['Some Title', 'Some Content']
    },
    getPrimaryKey: function () {
      return '7'
    }
  }

    // Stubs & spies
  const getTableNameStub = this.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'post'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn', function (Model) {
    return 7
  })

  const escapeKeysSpy = this.spy(CONNECTOR, 'escapeKeys')

  const fetchColumnsStub = this.stub(CONNECTOR, 'fetchColumns', function (table, paylod) {
    var result = []
    result.push('title')
    result.push('content')
    return result
  })

  const lodashValuesStub = this.stub(lodash, 'values', function (payload) { return ['Some Title', 'Some Content'] })

  function cb (errParameter, instance) { }
  const cbSpy = this.spy(cb)

  const queryStub = this.stub(CONNECTOR, '_query', function (query, values, cbSpy, executor) {
    executor({ affectedRows: 1 })
  })

    // Execution
  saveMethod.bind(CONNECTOR, Model, instance, cbSpy)()

    // Test
  const expectedQueryString = 'UPDATE `post` SET `title` = ?,`content` = ? WHERE 7 = ?'

  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(fetchColumnsStub.calledWith('post', ['Some Title', 'Some Content']))
  t.ok(escapeKeysSpy.called)
  t.ok(escapeKeysSpy.calledWith(['title', 'content']))
  t.ok(lodashValuesStub.calledOnce)
  t.ok(lodashValuesStub.calledWith(['Some Title', 'Some Content']))
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith(expectedQueryString, ['Some Title', 'Some Content', '7'], cbSpy))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.args[0][0] === null)
  t.ok(cbSpy.calledWith(null, instance))

  t.end()
}))

test('### Test Save Valid Data nothing to save ###', sinon.test(function (t) {
    // Data
  const Model = ARROW.getModel('Posts')
  const instance = {
    toPayload: function () {
      return ['Some Title', 'Some Content']
    },
    getPrimaryKey: function () {
      return '7'
    }
  }

    // Stubs & spies
  const getTableNameStub = this.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'post'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn', function (Model) {
    return 7
  })

  const escapeKeysSpy = this.spy(CONNECTOR, 'escapeKeys')

  const fetchColumnsStub = this.stub(CONNECTOR, 'fetchColumns', function (table, paylod) {
    var result = []
    result.push('title')
    result.push('content')
    return result
  })

  const lodashValuesStub = this.stub(lodash, 'values', function (payload) { return ['Some Title', 'Some Content'] })

  function cb (errParameter, instance) { }
  const cbSpy = this.spy(cb)

  const queryStub = this.stub(CONNECTOR, '_query', function (query, values, cbSpy, executor) {
    executor(undefined)
  })

    // Execution
  saveMethod.bind(CONNECTOR, Model, instance, cbSpy)()

    // Test
  const expectedQueryString = 'UPDATE `post` SET `title` = ?,`content` = ? WHERE 7 = ?'

  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(fetchColumnsStub.calledWith('post', ['Some Title', 'Some Content']))
  t.ok(escapeKeysSpy.called)
  t.ok(escapeKeysSpy.calledWith(['title', 'content']))
  t.ok(lodashValuesStub.calledOnce)
  t.ok(lodashValuesStub.calledWith(['Some Title', 'Some Content']))
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith(expectedQueryString, ['Some Title', 'Some Content', '7'], cbSpy))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.args[0].length === 0)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
