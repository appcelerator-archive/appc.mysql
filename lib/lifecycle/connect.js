var mysql = require('../../node_modules/mysql');

/**
 * Connects to your data store; this connection can later be used by your connector's methods.
 * @param next
 */
exports.connect = function (next) {
	var connected = function connectedCallback(err) {
		if (err) {
			next(err);
		}
		else {
			next();
		}
	};

	if (this.config.connection_pooling || this.config.connectionPooling) {
		this.pool = mysql.createPool(this.config);
		this.pool.getConnection(function pooledGetConnection(err, connection) {
			if (err) {
				next(err);
			}
			else {
				// We successfully verified that the pool is working; release the connection for future use.
				connection.release();
				connected();
			}
		});
	}
	else {
		this.connection = mysql.createConnection(this.config);
		this.connection.connect(connected);
	}
};
