// jscs:disable jsDoc
var should = require('should');

exports.create = {
	iterations: 1, // To run this test multiple times (useful when you're caching results), increase this number.
	insert: {
		title: 'Nolan',
		content: 'Wright'
	},
	check: function (result) {
		should(result.title).be.ok;
		should(result.content).be.ok;
	}
};
