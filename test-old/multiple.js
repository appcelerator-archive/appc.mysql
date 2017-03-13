var should = require('should'),
	async = require('async'),
	_ = require('lodash'),
	base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	connector = base.connector;

describe('Multiple', function () {
	var originalConnectors,
		ourServer;

	before(function (next) {
		originalConnectors = server.config.connectors;
		var tasks = [],
			baseConfig = originalConnectors['appc.mysql'],
			testConnectors = {};

		for (var i = 1; i <= 4; i++) {
			tasks = tasks.concat([
				'CREATE TABLE ' + baseConfig.database + '.users' + i +
				'(' +
				'	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
				'	name VARCHAR(255),' +
				'	email VARCHAR(255)' +
				')'
			]);

			testConnectors['db.' + i] = {
				database: baseConfig.database,

				connector: 'appc.mysql',
				host: baseConfig.host,
				user: baseConfig.user,
				password: baseConfig.password,

				modelAutogen: true,
				generateModelsFromSchema: true
			};
		}

		async.eachSeries(tasks, function (query, callback) {
			connector._query(query, function (err) {
				console.error('query failed:');
				console.error(query);
				callback(err);
			}, function () {
				callback();
			});
		}, function () {
			ourServer = new Arrow({
				connectors: testConnectors,
				port: (Math.random() * 40000 + 2000) | 0
			});
			ourServer.start(function () {
				next();
			});
		});
	});

	it('should create models from tables', function () {
		for (var i = 1; i <= 4; i++) {
			var Model = ourServer.getModel('db.' + i + '/users' + i);
			should(Model).be.ok;
			should(Model.generated).be.true;
		}
	});

	after(function (next) {
		ourServer.stop(next);
	});

});
