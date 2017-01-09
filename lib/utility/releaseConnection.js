/**
 * Release a connection to the MySQL server.
 * @param connection
 */
exports.releaseConnection = function releaseConnection(connection) {
	try {
		this.logger.trace('connection released back to the pool');
		connection.release();
	}
	catch (E) { }
};
