# MYSQL Connector

This is a API Builder connector to MYSQL.

To install:

```bash
$ api install appc.mysql --save
```

Use in your application:

```javascript
var MYSQLConnector = require('appc.mysql'),
	connector = new MYSQLConnector({
		host: 'localhost',
		username: '',
		password: '',
		database: 'test'
	});
```

By default with use `localhost`, `root` and empty password.

However, you must set a database.

Now reference the connector in your model.

```javascript
var Account = APIBuilder.createModel('Account',{
	fields: {
		Name: {type:'string', required: true, validator: /[a-zA-Z]{3,}/ }
	},
	connector: connector
});
```

If you want to map a specific model to a specific sobject name, use metadata.  For example, to map the `account` model to the table named `accounts`, set it such as:

```javascript
var User = APIBuilder.createModel('account',{
	fields: {
		Name: {type:'string', required: false, validator: /[a-zA-Z]{3,}/ }
	},
	connector: connector,
	metadata: {
		mysql: {
			table: 'accounts'
		}
	}
});
```
