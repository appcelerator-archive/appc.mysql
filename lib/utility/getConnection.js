/**
 * Gets a connection to the MySQL server.
 * @param callback
 */
exports.getConnection = function getConnection(callback) {
	if (this.pool) {
		this.pool.getConnection(function (err, connection) {
			callback(err, connection);
		});
	} else {
		callback(null, this.connection);
	}
};
