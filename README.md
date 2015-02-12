# MySQL Connector

This is an Arrow connector to MySQL.

> This software is pre-release and not yet ready for usage.  Please don't use this just yet while we're working through testing and finishing it up. Once it's ready, we'll make an announcement about it.

To install:

```bash
$ appc install connector/appc.mysql --save
```

By default we use `localhost`, `root` and empty password.

However, you must set a database in your configuration.

Now reference the connector in your model.

```javascript
var Account = Arrow.Model.extend('Account',{
	fields: {
		Name: { type: String, required: true, validator: /[a-zA-Z]{3,}/ }
	},
	connector: 'appc.mysql'
});
```

If you want to map a specific model to a specific table, use metadata.  For example, to map the `account` model to the table named `accounts`, set it such as:

```javascript
var Account = Arrow.Model.extend('account',{
	fields: {
		Name: { type: String, required: false, validator: /[a-zA-Z]{3,}/ }
	},
	connector: 'appc.mysql',
	metadata: {
		'appc.mysql': {
			table: 'accounts'
		}
	}
});
```

# Testing

To use the tests, you'll want to create a database with the following tables:

```
CREATE TABLE post
(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255),
	content VARCHAR(255)
);
CREATE TABLE super_post
(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255),
	content VARCHAR(255)
);
CREATE TABLE employee
(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(255),
	last_name VARCHAR(255),
	email_address VARCHAR(255)
);
```

# License

This source code is licensed as part of the Appcelerator Enterprise Platform and subject to the End User License Agreement and Enterprise License and Ordering Agreement. Copyright (c) 2014-2015 by Appcelerator, Inc. All Rights Reserved. This source code is Proprietary and Confidential to Appcelerator, Inc.
