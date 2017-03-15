/**
 * Disconnects from your data store.
 * @param next
 */
exports.disconnect = function (next) {
  var self = this
  var toEnd = this.pool || this.connection

  if (toEnd) {
    toEnd.end(function () {
      self.pool = self.connection = null
      next()
    })
  } else {
    next()
  }
}
