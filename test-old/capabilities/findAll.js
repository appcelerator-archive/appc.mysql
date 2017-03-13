// jscs:disable jsDoc
var should = require('should');

exports.findAll = {
	// To run this test multiple times (useful when you're caching results), increase this number.
	iterations: 1,
	insert: {
		title: 'Nolan',
		content: 'Wright'
	},
	check: function (results) {
		should(results.length).be.above(0);
		for (var i = 0; i < results.length; i++) {
			var result = results[i];
			should(result.id).be.ok;
			should(result.title).be.ok;
			should(result.content).be.ok;
		}
	}
};
