// jscs:disable jsDoc
var should = require('should');

exports.findByID = {
	// To run this test multiple times (useful when you're caching results), increase this number.
	iterations: 1,
	insert: {
		title: 'Nolan',
		content: 'Wright'
	},
	check: function (result) {
		should(result.id).be.ok;
		should(result.title).equal('Nolan');
		should(result.content).equal('Wright');
	}
};
