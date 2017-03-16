const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const createMethod = require('../../../lib/methods/create')['create']
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

test('### Test Create with valid data no id ###', sinon.test(function (t) {
    // Data
  const Model = ARROW.getModel('Posts')
  Model.instance = function (values, isSomething) {
    return {
      title: 'Some Title',
      content: 'Some Content',
      toPayload () {
        return ['Some Title', 'Some Content']
      },
      setPrimaryKey (id) { }
    }
  }
  const values = 'someValues'

    // Stubs & spies
  const getTableNameStub = this.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'post'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn', function (Model) {
    return undefined
  })

  const fetchColumnsStub = this.stub(CONNECTOR, 'fetchColumns', function (table, paylod) {
    var result = []
    result.push('title')
    result.push('content')
    return result
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys', function (columns) {
    return columns
  })

  const returnPlaceholderStub = this.stub(CONNECTOR, 'returnPlaceholder', function () {
    return '?'
  })

  const lodashValuesStub = this.stub(lodash, 'values', function (payload) { return ['Some Title', 'Some Content'] })

  function cb (errParameter, instance) { }
  const cbSpy = this.spy(cb)

  function executor (result) { }

  const queryStub = this.stub(CONNECTOR, '_query', function (query, data, cbSpy, executor) { executor({ insertId: 7 }) })

    // Execution
  createMethod.bind(CONNECTOR, Model, values, cbSpy, executor)()

    // Test
  const expectedQueryString = 'INSERT INTO post (title,content) VALUES (?,?)'

  const data = ['Some Title', 'Some Content']

  t.ok(getTableNameStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(escapeKeysStub.calledOnce)
  t.ok(returnPlaceholderStub.calledTwice)
  t.ok(lodashValuesStub.calledOnce)
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith(expectedQueryString, data))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null))

  t.end()
}))

test('### Test Create with valid data with id ###', sinon.test(function (t) {
    // Data
  CONNECTOR.metadata.schema = {
    objects: {
      post: {
        primaryKeyColumn: 'id'
      }
    }
  }
  const Model = ARROW.getModel('Posts')
  Model.instance = function (values, isSomething) {
    return {
      title: 'Some Title',
      content: 'Some Content',
      toPayload () {
        return ['Some Title', 'Some Content']
      },
      setPrimaryKey (id) { }
    }
  }
  const values = 'someValues'

    // Stubs & spies
  const getTableNameStub = this.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'post'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn', function (Model) {
    return 'id'
  })

  const fetchColumnsStub = this.stub(CONNECTOR, 'fetchColumns', function (table, paylod) {
    var result = []
    result.push('title')
    result.push('content')
    return result
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys', function (columns) {
    return columns
  })

  const returnPlaceholderStub = this.stub(CONNECTOR, 'returnPlaceholder', function () {
    return '?'
  })

  const lodashValuesStub = this.stub(lodash, 'values', function (payload) { return ['Some Title', 'Some Content'] })

  function cb (errParameter, instance) { }
  const cbSpy = this.spy(cb)

  function executor (result) { }

  const queryStub = this.stub(CONNECTOR, '_query', function (query, data, cbSpy, executor) { executor({ insertId: 7 }) })

    // Execution
  createMethod.bind(CONNECTOR, Model, values, cbSpy, executor)()

    // Test
  const expectedQueryString = 'INSERT INTO post (id,title,content) VALUES (NULL, ?,?)'

  const data = ['Some Title', 'Some Content']

  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(fetchColumnsStub.calledWith('post', ['Some Title', 'Some Content']))
  t.ok(escapeKeysStub.calledOnce)
  t.ok(escapeKeysStub.calledWith(['title', 'content']))
  t.ok(returnPlaceholderStub.calledTwice)
  t.ok(lodashValuesStub.calledOnce)
  t.ok(lodashValuesStub.calledWith(['Some Title', 'Some Content']))
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith(expectedQueryString, data))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null))

  t.end()
}))

test('### Test Create with valid data with id auto-increment ###', sinon.test(function (t) {
    // Data
  CONNECTOR.metadata.schema = {
    objects: {
      post: {
        id: {
          EXTRA: 'auto_increment'
        }
      }
    }
  }
  const Model = ARROW.getModel('Posts')
  Model.instance = function (values, isSomething) {
    return {
      title: 'Some Title',
      content: 'Some Content',
      toPayload () {
        return ['Some Title', 'Some Content']
      },
      setPrimaryKey (id) { }
    }
  }
  const values = 'someValues'

    // Stubs & spies
  const getTableNameStub = this.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'post'
  })

  const getPrimaryKeyColumnStub = this.stub(CONNECTOR, 'getPrimaryKeyColumn', function (Model) {
    return 'id'
  })

  const fetchColumnsStub = this.stub(CONNECTOR, 'fetchColumns', function (table, paylod) {
    var result = []
    result.push('title')
    result.push('content')
    return result
  })

  const escapeKeysStub = this.stub(CONNECTOR, 'escapeKeys', function (columns) {
    return columns
  })

  const returnPlaceholderStub = this.stub(CONNECTOR, 'returnPlaceholder', function () {
    return '?'
  })

  const lodashValuesStub = this.stub(lodash, 'values', function (payload) { return ['Some Title', 'Some Content'] })

  function cb (errParameter, instance) { }
  const cbSpy = this.spy(cb)

  function executor (result) { }

  const queryStub = this.stub(CONNECTOR, '_query', function (query, data, cbSpy, executor) { executor({ insertId: 7 }) })

    // Execution
  createMethod.bind(CONNECTOR, Model, values, cbSpy, executor)()

    // Test
  const expectedQueryString = 'INSERT INTO post (id,title,content) VALUES (NULL, ?,?)'

  const data = ['Some Title', 'Some Content']

  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(fetchColumnsStub.calledWith('post', ['Some Title', 'Some Content']))
  t.ok(escapeKeysStub.calledOnce)
  t.ok(escapeKeysStub.calledWith(['title', 'content']))
  t.ok(returnPlaceholderStub.calledTwice)
  t.ok(lodashValuesStub.calledOnce)
  t.ok(lodashValuesStub.calledWith(['Some Title', 'Some Content']))
  t.ok(queryStub.calledOnce)
  t.ok(queryStub.calledWith(expectedQueryString, data))
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null))

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
