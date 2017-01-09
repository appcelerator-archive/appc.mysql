/**
 * Executes a query against the database.
 * @param query
 * @param data
 * @param callback
 * @param executor
 * @private
 */
exports._query = function _query(query, data, callback, executor) {
	if (arguments.length < 4) {
		executor = callback;
		callback = data;
		data = null;
	}
	var self = this,
		pool = this.pool,
		logger = this.logger,
		transaction = this.config.query_transactions || this.config.queryTransactions;
	logger.trace('MYSQL QUERY=>', query, data);

	/**
	 * Execute query over db.
	 * @param connection
	 */
	var executeQuery = function (connection) {
		/**
		 * Handles error during db transaction.
		 * @param err
		 */
		var handleTransactionError = function (err) {
			connection.rollback(function () {
				self.releaseConnection(connection);
				callback(err);
			});
		};

		connection.query(query, data, function (err, results) {
			if (transaction) {
				if (err) {
					handleTransactionError(err);
				} else {
					connection.commit(function (err) {
						if (err) {
							return handleTransactionError(err);
						}

						if (pool) {
							self.releaseConnection(connection);
						}
						executor(results);
					});
				}
			} else {
				if (pool) {
					self.releaseConnection(connection);
				}
				if (err) {
					callback(err);
				} else {
					executor(results);
				}
			}
		});
	};

	this.getConnection(function (err, connection) {
		if (err) { return callback(err); }

		if (transaction) {
			connection.beginTransaction(function (err) {
				if (err) { return callback(err); }

				executeQuery(connection);
			});
		} else {
			executeQuery(connection);
		}
	});
};
