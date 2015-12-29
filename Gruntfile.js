module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		appcJs: {
			src: ['*.js', 'lib/**/*.js', 'test/**/*.js']
		},
		mocha_istanbul: {
			coverage: {
				src: 'test',
				options: {
					timeout: 30000,
					ignoreLeaks: false,
					check: {
						statements: 90,
						branches: 85,
						functions: 95,
						lines: 90
					}
				}
			}
		},
		clean: ['tmp']
	});

	// Load grunt plugins for modules.
	grunt.loadNpmTasks('grunt-appc-js');
	grunt.loadNpmTasks('grunt-mocha-istanbul');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks.
	grunt.registerTask('default', ['appcJs', 'mocha_istanbul:coverage', 'clean']);

};
