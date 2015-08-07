exports.getConnection = function getConnection(callback) {
	if (this.pool) {
		this.pool.getConnection(function pooledGetConnection(err, connection) {
			callback(err, connection);
		});
	}
	else {
		callback(null, this.connection);
	}
};
