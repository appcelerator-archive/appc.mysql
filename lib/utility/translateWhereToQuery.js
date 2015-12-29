/**
 * Translates a "where" object in to the relevant portion of a SQL Query.
 * @param where
 * @param values
 * @returns {string}
 */
exports.translateWhereToQuery = function (where, values) {
	var whereQuery = '';
	for (var key in where) {
		if (where.hasOwnProperty(key) && where[key] !== undefined) {
			whereQuery += whereQuery === '' ? ' WHERE' : ' AND';
			whereQuery += ' ' + key;
			if (where[key] && where[key].$like) {
				whereQuery += ' LIKE';
				values.push(where[key].$like);
			} else {
				whereQuery += ' =';
				values.push(where[key]);
			}
			whereQuery += ' ?';
		}
	}
	return whereQuery;
};
