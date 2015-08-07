var should = require('should');

exports.query = {
	// To run this test multiple times (useful when you're caching results), increase this number.
	iterations: 1,
	// TODO: If your connector doesn't support creating records, delete this "insert" object.
	insert: [
		{
			title: 'Rick',
			content: 'Blalock'
		},
		{
			title: 'Nolan',
			content: 'Wright'
		}
	],
	query: {
		where: {
			title: 'Nolan'
		}
	},
	check: function (results) {
		should(results.length).be.above(0);
		// TODO: Check your results.
		should(results[0].title).be.ok;
		should(results[0].content).be.ok;
	}
};
