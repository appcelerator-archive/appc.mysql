#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { logLevel: 'error', connectors: { 'appc.mysql': { host: 'sql11.freemysqlhosting.net', database: 'sql11160473', user: 'sql11160473', password: 'ZeF5BhEnek', modelAutogen: true, generateModelsFromSchema: true}} };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
