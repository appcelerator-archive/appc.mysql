exports.connect = {
	goodConfig: {
		connectionPooling: true,
		connectionLimit: 10,
		host: 'localhost',
		port: 3306,
		database: 'test',
		user: 'root',
		password: 'root',
		generateModelsFromSchema: true,
		modelAutogen: true
	},
	badConfig: {
		connectionPooling: true,
		connectionLimit: 10,
		host: 'localhost',
		port: 3306,
		database: 'test',
		user: 'root',
		password: 'some-bad-password',
		generateModelsFromSchema: true,
		modelAutogen: true
	}
};
