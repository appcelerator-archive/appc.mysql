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

			// Create models based on your schema that can be used in your API.
			generateModelsFromSchema: true,

			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: false

		}
	}
};