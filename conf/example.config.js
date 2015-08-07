module.exports = {
	connectors: {
		'appc.mysql': {
			connectionPooling: true,
			connectionLimit: 10,

			host: 'localhost',
			port: 3306,
			database: 'test',
			user: 'root',
			password: '',

			generateModelsFromSchema: true,
			modelAutogen: true
		}
	}
};