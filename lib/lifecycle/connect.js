var mysql = require('../../node_modules/mysql')

/**
 * Connects to your data store; this connection can later be used by your connector's methods.
 * @param next
 */
exports.connect = function (next) {
  if (this.config.connection_pooling || this.config.connectionPooling) {
    this.pool = mysql.createPool(this.config)
    this.pool.getConnection(function (err, connection) {
      if (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          err.message = 'Connecting to your MySQL server failed; either it isn\'t running, or your connection details are invalid.'
        }
        next(err)
      } else {
        // We successfully verified that the pool is working; release the connection for future use.
        connection.release()
        next()
      }
    })
  } else {
    this.connection = mysql.createConnection(this.config)
    this.connection.connect(next)
  }
}
