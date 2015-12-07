exports.translateWhereToQuery = function (where, values) {
	var whereQuery = '';
	for (var key in where) {
		if (where.hasOwnProperty(key) && where[key] !== undefined) {
			if (whereQuery === '') {
				whereQuery = ' WHERE';
			}
			else {
				whereQuery += ' AND';
			}
			whereQuery += ' ' + key;
			if (where[key] && where[key].$like) {
				whereQuery += ' LIKE';
				values.push(where[key].$like);
			}
			else {
				whereQuery += ' =';
				values.push(where[key]);
			}
			whereQuery += ' ?';
		}
	}
	return whereQuery;
};