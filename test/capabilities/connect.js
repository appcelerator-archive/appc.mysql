var _ = require('lodash');

var goodConfig = {
	connectionPooling: true,
	connectionLimit: 10,
	host: 'localhost',
	port: 3306,
	database: 'test',
	user: 'root',
	password: 'root',
	generateModelsFromSchema: true,
	modelAutogen: true
};

exports.connect = {
	goodConfig: goodConfig,
	badConfigs: [
		_.defaults({host: '192.168.0.256'}, goodConfig),
		_.defaults({port: 3307}, goodConfig),
		_.defaults({user: 'a-bad-username'}, goodConfig),
		_.defaults({password: 'a-bad-password'}, goodConfig)
	]
};