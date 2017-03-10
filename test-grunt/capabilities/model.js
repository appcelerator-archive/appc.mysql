// jscs:disable jsDoc
var Arrow = require('arrow');

exports.model = Arrow.Model.extend('post', {
	fields: {
		title: {type: String},
		content: {type: String}
	}
});
