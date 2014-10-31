var _ = require('lodash'),
	appc = require('appc-cli-core'),
	async = require('async'),
	format = require('util').format,
	inquirer = require('inquirer');

var TYPE = require('../../appc').TYPE;

module.exports = {
	name: 'MYSQL Database',
	type: TYPE,
	generator: true,
	execute: generate,

	// fields are inquirer.js "questions". There's a bit more
	// functionality, but it's not mandatory. I'll doc soon.
	fields: []
};

// opts will contain answers to all field questions
function generate(opts, callback) {
	var fields = [],
		plugins;

	// set the log level for the plugin
	appc.log.level(opts.logLevel || 'info');

	console.log('mysql connector generator here');
	process.exit(1);
}

