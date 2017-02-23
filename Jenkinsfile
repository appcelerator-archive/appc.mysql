#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { logLevel: 'error', connectors: { 'appc.mysql': { host: 'db4free.net', database: 'arrowtest', user: 'arrowtest', password: 'mmpResearch6', modelAutogen: true, generateModelsFromSchema: true}} };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
