const test = require('tap').test
const server = require('../../server')
const sinon = require('sinon')
const upsertMethod = require('../../../lib/methods/upsert').upsert
const Arrow = require('arrow')

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

test('### Upsert - update ###', function (t) {
  const model = ARROW.getModel('Posts')
  var sandbox = sinon.sandbox.create()

  var tableNameStub = sandbox.stub(CONNECTOR, 'getTableName').callsFake(function (model) {
    return 'Post'
  })

  var primaryKeyStub = sandbox.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake(function (model) {
    return 'id'
  })

  var fetchColumnsStub = sandbox.stub(CONNECTOR, 'fetchColumns').callsFake(function (table, payload) {
    return ['title', 'content', 'books']
  })

  var findByIDStub = sandbox.stub(CONNECTOR, 'findByID').callsFake(function (model, id, callback) {
    callback(null, { title: 'test', content: 'test', books: [] })
  })

  var queryStub = sandbox.stub(CONNECTOR, '_query').callsFake(function (query, values, callback, queryCallback) {
    queryCallback({
      affectedRows: 1,
      insertId: 0
    })
  })

  const cbSpy = sandbox.spy()
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }

  const testInstance = {
    title: 'test',
    content: 'test',
    books: [],
    id: '4',
    setPrimaryKey (id) { },
    toPayload () { return ['test', 'test', []] }
  }

  model.instance = function (values, skip) {
    return testInstance
  }

  upsertMethod.bind(CONNECTOR, model, '4', test, cbSpy)()
  t.ok(queryStub.called)
  t.ok(tableNameStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(findByIDStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, testInstance))
  sandbox.restore()
  t.end()
})

test('### Upsert - update without primary key ###', function (t) {
  const model = ARROW.getModel('Posts')
  var sandbox = sinon.sandbox.create()

  var tableNameStub = sandbox.stub(CONNECTOR, 'getTableName').callsFake(function (model) {
    return 'Post'
  })

  var primaryKeyStub = sandbox.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake(function (model) {
    return undefined
  })

  var fetchColumnsStub = sandbox.stub(CONNECTOR, 'fetchColumns').callsFake(function (table, payload) {
    return ['title', 'content', 'books']
  })

  var findByIDStub = sandbox.stub(CONNECTOR, 'findByID').callsFake(function (model, id, callback) {
    callback(null, { title: 'test', content: 'test', books: [] })
  })

  var arrowORMErrorStub = sandbox.stub(Arrow, 'ORMError').callsFake(function (message) { })
  const cbSpy = sandbox.spy()
  const testInstance = {
    title: 'test',
    content: 'test',
    books: [],
    id: '4',
    setPrimaryKey (id) { },
    toPayload () { return ['test', 'test', []] }
  }

  model.instance = function (values, skip) {
    return testInstance
  }

  upsertMethod.bind(CONNECTOR, model, '4', test, cbSpy)()
  t.ok(tableNameStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(findByIDStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(arrowORMErrorStub.calledOnce)
  sandbox.restore()
  t.end()
})

test('### Upsert - insert ###', function (t) {
  const model = ARROW.getModel('Posts')
  var sandbox = sinon.sandbox.create()

  var tableNameStub = sandbox.stub(CONNECTOR, 'getTableName').callsFake(function (model) {
    return 'Post'
  })

  var primaryKeyStub = sandbox.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake(function (model) {
    return 'id'
  })

  var fetchColumnsStub = sandbox.stub(CONNECTOR, 'fetchColumns').callsFake(function (table, payload) {
    return ['title', 'content', 'books']
  })
  var findByIDStub = sandbox.stub(CONNECTOR, 'findByID').callsFake(function (model, id, callback) {
    callback(null, undefined)
  })

  var queryStub = sandbox.stub(CONNECTOR, '_query').callsFake(function (query, data, callback, queryCallback) {
    queryCallback([{ id: 310, first_name: 'c', last_name: 'b', email_address: 'e' }])
  })
  const cbSpy = sandbox.spy()
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }

  const testInstance = {
    title: 'test',
    content: 'test',
    books: [],
    id: '4',
    setPrimaryKey (id) { },
    toPayload () { return ['test', 'test', []] }
  }

  model.instance = function (values, skip) {
    return testInstance
  }

  upsertMethod.bind(CONNECTOR, model, '4', test, cbSpy)()
  t.ok(queryStub.called)
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(tableNameStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(findByIDStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, testInstance))
  sandbox.restore()
  t.end()
})

test('### Upsert - insert without primary key ###', function (t) {
  const model = ARROW.getModel('Posts')
  var sandbox = sinon.sandbox.create()

  var tableNameStub = sandbox.stub(CONNECTOR, 'getTableName').callsFake(function (model) {
    return 'Post'
  })

  var primaryKeyStub = sandbox.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake(function (model) {
    return undefined
  })

  var fetchColumnsStub = sandbox.stub(CONNECTOR, 'fetchColumns').callsFake(function (table, payload) {
    return ['title', 'content', 'books']
  })
  var findByIDStub = sandbox.stub(CONNECTOR, 'findByID').callsFake(function (model, id, callback) {
    callback(null, undefined)
  })

  var queryStub = sandbox.stub(CONNECTOR, '_query').callsFake(function (query, data, callback, queryCallback) {
    queryCallback([{ id: 310, first_name: 'c', last_name: 'b', email_address: 'e' }])
  })
  const cbSpy = sandbox.spy()
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }

  const testInstance = {
    title: 'test',
    content: 'test',
    books: [],
    id: '4',
    setPrimaryKey (id) { },
    toPayload () { return ['test', 'test', []] }
  }

  model.instance = function (values, skip) {
    return testInstance
  }

  upsertMethod.bind(CONNECTOR, model, '4', test, cbSpy)()
  t.ok(queryStub.called)
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(tableNameStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(findByIDStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, testInstance))
  sandbox.restore()
  t.end()
})

test('### Upsert - error case ###', function (t) {
  const model = ARROW.getModel('Posts')
  var sandbox = sinon.sandbox.create()

  var tableNameStub = sandbox.stub(CONNECTOR, 'getTableName').callsFake(function (model) {
    return 'Post'
  })

  var primaryKeyStub = sandbox.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake(function (model) {
    return 'id'
  })

  var fetchColumnsStub = sandbox.stub(CONNECTOR, 'fetchColumns').callsFake(function (table, payload) {
    return ['title', 'content', 'books']
  })

  const cbSpy = sandbox.spy()

  t.throws(upsertMethod.bind(CONNECTOR, model, undefined, {}, cbSpy),
    'You must provide a Model id and data Object, that will be persisted')
  t.ok(tableNameStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(fetchColumnsStub.calledOnce)
  sandbox.restore()
  t.end()
})

test('### Upsert - findByID error ###', function (t) {
  const model = ARROW.getModel('Posts')
  var sandbox = sinon.sandbox.create()

  var tableNameStub = sandbox.stub(CONNECTOR, 'getTableName').callsFake(function (model) {
    return 'Post'
  })

  var primaryKeyStub = sandbox.stub(CONNECTOR, 'getPrimaryKeyColumn').callsFake(function (model) {
    return 'id'
  })

  var fetchColumnsStub = sandbox.stub(CONNECTOR, 'fetchColumns').callsFake(function (table, payload) {
    return ['title', 'content', 'books']
  })
  var findByIDStub = sandbox.stub(CONNECTOR, 'findByID').callsFake(function (model, id, callback) {
    callback(new Error('err'))
  })

  const cbSpy = sandbox.spy()
  var test = {
    title: 'test',
    content: 'test',
    books: []
  }

  const testInstance = {
    title: 'test',
    content: 'test',
    books: [],
    id: '4',
    setPrimaryKey (id) { },
    toPayload () { return ['test', 'test', []] }
  }

  model.instance = function (values, skip) {
    return testInstance
  }

  upsertMethod.bind(CONNECTOR, model, '4', test, cbSpy)()
  t.ok(tableNameStub.calledOnce)
  t.ok(fetchColumnsStub.calledOnce)
  t.ok(primaryKeyStub.calledOnce)
  t.ok(findByIDStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  const spyArg = cbSpy.firstCall.args[0]
  t.ok(spyArg instanceof Error)
  t.ok(spyArg.message === 'err')
  sandbox.restore()
  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
