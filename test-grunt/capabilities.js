var should = require('should'),
	base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	connector = base.connector;

describe('Connector Capabilities', Arrow.Connector.generateTests(connector, module));
