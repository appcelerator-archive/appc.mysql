// jscs:disable jsDoc
var should = require('should');

exports.distinct = {
	insert: [
		{title: 'Rick Blalock'},
		{title: 'Jeff Haynie'},
		{title: 'Jeff Haynie'},
		{title: 'Jeff Haynie'},
		{title: 'Jeff Haynie'},
		{title: 'Jeff Haynie'},
		{title: 'Chris Barber'},
		{title: 'Chris Barber'},
		{title: 'Chris Barber'},
		{title: 'Chris Barber'},
		{title: 'Nolan Wright'}
	],
	distinct: 'title',
	check: function (results) {
		should(results.length).equal(4);
		should(results).containEql('Rick Blalock');
		should(results).containEql('Jeff Haynie');
		should(results).containEql('Chris Barber');
		should(results).containEql('Nolan Wright');
	}
};
