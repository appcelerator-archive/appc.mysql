var should = require('should'),
  Arrow = require('arrow'),
  server = new Arrow(),
  connector = server.getConnector('appc.mysql')

exports.Arrow = Arrow
exports.server = server
exports.connector = connector

before(function (cb) {
  server.start(cb)
})

after(function (cb) {
  server.stop(cb)
})
