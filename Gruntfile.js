module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    mochaTest: {
      test: {
        src: ['test/integration/**/*.js'],
        options: {
          timeout: 30000
        }
      }
    }
  })

  // Load grunt plugins for modules.
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.registerTask('default', ['mochaTest'])
}
