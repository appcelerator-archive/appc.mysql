var should = require('should'),
	base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	connector = base.connector,
	transactionsConnector = server.getConnector('appc.mysql.2');

describe('Connector Capabilities', function () {
	describe('Connector Capabilities - w/o transactions', Arrow.Connector.generateTests(connector, module));

	describe('Connector Capabilities - with transactions', Arrow.Connector.generateTests(transactionsConnector, module));
});
