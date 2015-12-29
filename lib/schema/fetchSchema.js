/**
 * Fetches the schema for your connector.
 *
 * For example, your schema could look something like this:
 * {
 *     objects: {
 *         person: {
 *             first_name: {
 *                 type: 'string',
 *                 required: true
 *             },
 *             last_name: {
 *                 type: 'string',
 *                 required: false
 *             },
 *             age: {
 *                 type: 'number',
 *                 required: false
 *             }
 *         }
 *     }
 * }
 *
 * @param next
 * @returns {*}
 */
exports.fetchSchema = function (next) {
	var self = this;
	// If we already have the schema, just return it.
	if (this.schema) {
		return next(null, this.schema);
	}

	var query = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?';
	this._query(query, [this.config.database], next, function (results) {
		var schema = {
			objects: {},
			database: self.config.database,
			primary_keys: {}
		};
		results.forEach(function (result) {
			var entry = schema.objects[result.TABLE_NAME];
			if (!entry) {
				schema.objects[result.TABLE_NAME] = entry = {};
			}
			entry[result.COLUMN_NAME] = result;
			if (result.COLUMN_KEY === 'PRI') {
				schema.primary_keys[result.TABLE_NAME] = result.COLUMN_NAME;
			}
		});
		next(null, schema);
	});
};
