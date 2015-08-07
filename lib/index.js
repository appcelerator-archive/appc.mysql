/*
 Welcome to the MySQL connector!
 */
var _ = require('lodash');

/**
 * Creates the MySQL connector for Arrow.
 */
exports.create = function (Arrow) {
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
