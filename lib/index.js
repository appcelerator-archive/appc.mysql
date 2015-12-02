/*
 Welcome to the MySQL connector!
 */
var _ = require('lodash'),
	semver = require('semver');

/**
 * Creates the MySQL connector for Arrow.
 */
exports.create = function (Arrow) {
	var min = '1.7.0';
	if (semver.lt(Arrow.Version || '0.0.1', min)) {
		throw new Error('This connector requires at least version ' + min + ' of Arrow; please run `appc use latest`.');
	}
	var Connector = Arrow.Connector,
		Capabilities = Connector.Capabilities;

	return Connector.extend({
		filename: module.filename,
		capabilities: [
			Capabilities.ConnectsToADataSource,
			Capabilities.ValidatesConfiguration,
			//Capabilities.ContainsModels,
			Capabilities.GeneratesModels,
			Capabilities.CanCreate,
			Capabilities.CanRetrieve,
			Capabilities.CanUpdate,
			Capabilities.CanDelete,
			//Capabilities.AuthenticatesThroughConnector
		]
	});
};
