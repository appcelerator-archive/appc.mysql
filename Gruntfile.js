var exec = require('child_process').exec,
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

var BIN = './node_modules/.bin/',
	HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 40000,
				reporter: 'spec',
				bail: true
			},
			src: ['specs/**/*.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['lib/**/*.js', 'specs/**/*.js']
		},
		coverage: {
			src: ['specs/**/*.js']
		},
		clean: {
			pre: ['*.log'],
			post: ['tmp']
		}
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// set required env vars
	grunt.registerTask('env', function() {
		process.env.TEST = '1';

		// create list of search paths
		var configs = [path.resolve('.apibuilder')];
		if (HOME) { configs.push(path.join(HOME, '.apibuilder')); }

		for (var i = 0; i < configs.length; i++) {
			var config = configs[i];
			if (fs.existsSync(config)) {
				_.merge(process.env, JSON.parse(fs.readFileSync(config, 'utf8')));
				break;
			}
		}

		if (process.env.TRAVIS && !process.env.npm_config__auth) {
			process.env.npm_config__auth = process.env.NPM_AUTH_KEY;
		}
	});

	// run test coverage
	grunt.registerMultiTask('coverage', 'generate test coverage report', function() {
		var done = this.async(),
			cmd = BIN + 'istanbul cover --report html ' + BIN + '_mocha -- -R min ' +
				this.filesSrc.reduce(function(p,c) { return (p || '') + ' "' + c + '" '; });

		grunt.log.debug(cmd);
		exec(cmd, function(err, stdout, stderr) {
			if (err) { grunt.fail.fatal(err); }
			if (/No coverage information was collected/.test(stderr)) {
				grunt.fail.warn('No coverage information was collected. Report not generated.');
			} else {
				grunt.log.ok('test coverage report generated to "./coverage/index.html"');
			}
			done();
		});
	});

	// register tasks
	grunt.registerTask('cover', ['clean:pre', 'env', 'coverage', 'clean:post']);
	grunt.registerTask('default', ['clean:pre', 'env', 'jshint', 'mochaTest', 'clean:post']);
};
