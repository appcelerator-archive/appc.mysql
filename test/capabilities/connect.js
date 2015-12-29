// jscs:disable jsDoc
var _ = require('lodash');

var goodConfig = require('../../conf/local').connectors['appc.mysql'];

exports.connect = {
	goodConfig: goodConfig,
	badConfigs: [
		_.defaults({host: '192.168.0.256'}, goodConfig),
		_.defaults({port: 3307}, goodConfig),
		_.defaults({user: 'a-bad-username'}, goodConfig),
		_.defaults({password: 'a-bad-password'}, goodConfig)
	]
};
