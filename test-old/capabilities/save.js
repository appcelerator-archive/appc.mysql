// jscs:disable jsDoc
var should = require('should');

exports.save = {
	iterations: 1, // To run this test multiple times (useful when you're caching results), increase this number.
	insert: {
		title: 'Dawson',
		content: 'Toth'
	},
	update: {
		content: 'Tooth'
	},
	check: function (result) {
		should(result.id).be.ok;
		should(result.title).equal('Dawson');
		should(result.content).equal('Tooth');
	}
};
