var Arrow = require('arrow');

/**
 * Fetches metadata describing your connector's proper configuration.
 * @param next
 */
exports.fetchMetadata = function fetchMetadata(next) {
	next(null, {
		fields: [
			// TODO: Add a field for each config property and customize the type, name, and description.
			Arrow.Metadata.Checkbox({
				name: 'connectionPooling',
				description: 'whether or not to use connection pooling',
				required: false
			}),
			Arrow.Metadata.NumField({
				name: 'connectionLimit',
				description: 'if using connectionPooling, the number of connections to allow',
				required: false
			}),
			Arrow.Metadata.Text({
				name: 'host',
				description: 'the host name to your database',
				required: true
			}),
			Arrow.Metadata.NumField({
				name: 'port',
				description: 'the port your database is running on',
				'default': 3306,
				required: false
			}),
			Arrow.Metadata.Text({
				name: 'user',
				description: 'the username for connecting to your database',
				required: true
			}),
			Arrow.Metadata.Text({
				name: 'password',
				description: 'the password for connecting to your database',
				required: false
			}),
			Arrow.Metadata.Checkbox({
				name: 'generateModelsFromSchema',
				description: 'whether or not to generate models from your schema',
				required: false
			}),
			Arrow.Metadata.Checkbox({
				name: 'modelAutogen',
				description: 'whether or not generated models should create their own APIs',
				required: false
			})
		]
	});
};
