exports.escapeKeys = function (keys) {
	return keys.map(function (item) {
		return '`' + item + '`';
	});
};
