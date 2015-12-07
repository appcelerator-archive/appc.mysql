module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		mocha_istanbul: {
			coverage: {
				src: 'test',
				options: {
					timeout: 30000,
					ignoreLeaks: false,
					check: {
						statements: 90,
						branches: 90,
						functions: 90,
						lines: 90
					}
				}
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['lib/**/*.js', 'test/**/*.js']
		},
		clean: ['tmp']
	});

	// Load grunt plugins for modules.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-istanbul');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks.
	grunt.registerTask('default', ['jshint', 'mocha_istanbul:coverage', 'clean']);

};
