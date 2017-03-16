/**
 * Executes a query against the database.
 * @param query
 * @param data
 * @param callback
 * @param executor
 * @private
 */
exports._query = function _query (query, data, callback, executor) {
  if (arguments.length < 4) {
    executor = callback
    callback = data
    data = null
  }
  var pool = this.pool
  var logger = this.logger

  logger.trace('MYSQL QUERY=>', query, data)
  this.getConnection(function (err, connection) {
    if (err) { return callback(err) }
    connection.query(query, data, function (err, results) {
      if (pool) {
        try {
          logger.trace('connection released back to the pool')
          connection.release()
        } catch (E) { }
      }
      if (err) {
        callback(err)
      } else {
        executor(results)
      }
    })
  })
}
