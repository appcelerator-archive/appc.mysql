var should = require('should');

exports.findOne = {
	// To run this test multiple times (useful when you're caching results), increase this number.
	iterations: 1,
	// TODO: If your connector doesn't support creating records, delete this "insert" object.
	insert: {
		title: 'Nolan',
		content: 'Wright'
	},
	check: function (result) {
		// TODO: Check your results.
		should(result.id).be.ok;
		should(result.title).equal('Nolan');
		should(result.content).equal('Wright');
	}
};
