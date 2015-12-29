/**
 * Escapes the provided keys for usage in a SQL query.
 * @param keys
 * @returns {*|Array|{}}
 */
exports.escapeKeys = function (keys) {
	return keys.map(function (item) {
		return '`' + item + '`';
	});
};
