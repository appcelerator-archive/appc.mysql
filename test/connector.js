var should = require('should'),
	async = require('async'),
	_ = require('lodash'),
	base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	connector = base.connector;

describe('Connector', function () {

	var Model;

	before(function (next) {
		// define your model
		Model = Arrow.Model.extend('post', {
			fields: {
				title: {type: String},
				content: {type: String}
			},
			connector: 'appc.mysql'
		});

		should(Model).be.an.object;

		async.eachSeries([
			'DROP TABLE IF EXISTS post',
			'CREATE TABLE post' +
			'(' +
			'	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
			'	title VARCHAR(255),' +
			'	content VARCHAR(255)' +
			')',
			'DROP TABLE IF EXISTS super_post',
			'CREATE TABLE super_post' +
			'(' +
			'	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
			'	title VARCHAR(255),' +
			'	content VARCHAR(255)' +
			')',
			'DROP TABLE IF EXISTS employee',
			'CREATE TABLE employee' +
			'(' +
			'	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
			'	first_name VARCHAR(255),' +
			'	last_name VARCHAR(255),' +
			'	email_address VARCHAR(255)' +
			')',
			'DROP TABLE IF EXISTS typeTesting',
			'CREATE TABLE typeTesting' +
			'(' +
			'	my_tinyint TINYINT,' +
			'	my_smallint SMALLINT,' +
			'	my_mediumint MEDIUMINT,' +
			'	my_bigint BIGINT,' +
			'	my_int INT,' +
			'	my_integer INTEGER,' +
			'	my_float FLOAT,' +
			'	my_bit BIT,' +
			'	my_double DOUBLE,' +
			'	my_binary BINARY,' +
			'	my_date DATE,' +
			'	my_datetime DATETIME,' +
			'	my_time TIME,' +
			'	my_year YEAR,' +
			'	my_varchar VARCHAR(255),' +
			'	my_char CHAR(5),' +
			'	my_tinyblob TINYBLOB,' +
			'	my_blob BLOB,' +
			'	my_mediumblob MEDIUMBLOB,' +
			'	my_longblob LONGBLOB,' +
			'	my_tinytext TINYTEXT,' +
			'	my_mediumtext MEDIUMTEXT,' +
			'	my_longtext LONGTEXT,' +
			'	my_text TEXT' +
			')',
			'DROP VIEW IF EXISTS hyphens',
			'CREATE VIEW hyphens AS SELECT title, content, CONCAT(title,\' - \',content) AS hyphenated FROM post'
		], function (query, callback) {
			connector._query(query, function (err) {
				console.error('query failed:');
				console.error(query);
				console.error(err);
				callback(err);
			}, function (result) {
				callback();
			});
		}, function () {
			server.reload(function () {
				next();
			});
		});
	});

	after(function (next) {
		Model.deleteAll(function (err) {
			if (err) {
				console.error(err.message);
			}
			next();
		});
	});

	it('should be able to fetch schema', function (next) {
		connector.fetchSchema(function (err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.object;
			next();
		});
	});

	it('should create models from tables', function () {
		var SuperPost = connector.getModel('appc.mysql/super_post');
		should(SuperPost).be.ok;
		should(SuperPost.generated).be.true;
		var Names = connector.getModel('appc.mysql/hyphens');
		should(Names).be.ok;
		should(Names.generated).be.true;
	});

	it('should be able to extend from tables', function (next) {
		var SupererPost = connector.getModel('appc.mysql/super_post').extend('superer_post', {
			fields: {
				MyTitle: {name: 'title', type: String},
				MyContent: {name: 'content', type: String}
			},
			connector: connector
		});
		should(SupererPost).be.ok;
		should(SupererPost._supermodel).be.ok;
		should(SupererPost._parent).be.ok;
		SupererPost.create({
			MyTitle: 'cheese',
			MyContent: 'was eaten this night'
		}, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.MyTitle).be.ok;
			should(instance.MyContent).be.ok;
			next();
		});
	});

	it('should be able to use named fields', function (next) {
		var Model = Arrow.Model.extend('post', {
				fields: {
					MyTitle: {name: 'title', type: String},
					MyContent: {name: 'content', type: String}
				},
				connector: 'appc.mysql'
			}),
			title = 'Test',
			content = 'Hello world',
			object = {
				MyTitle: title,
				MyContent: content
			};
		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.MyTitle).equal(title);
			should(instance.MyContent).equal(content);
			Model.query({
				where: {
					MyTitle: 'Test'
				}
			}, function (err, coll) {
				should(err).be.not.ok;
				should(coll.length).be.greaterThan(0);
				instance.delete(next);
			});
		});
	});

	it('API-298: should be able to use named fields', function (next) {
		// create a model from a mysql table
		var uc_1 = Arrow.createModel('uc_1', {
				fields: {
					fname: {type: String, description: 'First name', name: 'first_name', required: true},
					lname: {type: String, description: 'Last name', required: true, name: 'last_name'},
					email: {type: String, description: 'Email address', required: true, name: 'email_address'}
				},
				connector: 'appc.mysql',
				metadata: {
					'appc.mysql': {table: 'employee'}
				}
			}),
			object = {
				fname: 'Test',
				lname: 'Smith',
				email: 'dtoth@appcelerator.com'
			};
		uc_1.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.fname).equal(object.fname);
			should(instance.lname).equal(object.lname);
			should(instance.email).equal(object.email);
			uc_1.query({
				where: {
					lname: object.lname
				}
			}, function (err, coll) {
				should(err).be.not.ok;
				should(coll.length).be.greaterThan(0);
				instance.delete(next);
			});
		});
	});

	it('should be able to ignore fields absent from schema', function (next) {
		var Model = Arrow.Model.extend('post', {
				fields: {
					MyTitle: {name: 'title', type: String},
					MyContent: {name: 'content', type: String},
					MyCustomField: {type: String}
				},
				connector: 'appc.mysql'
			}),
			title = 'Test',
			content = 'Hello world',
			object = {
				MyTitle: title,
				MyContent: content,
				MyCustomField: 'should be ignored'
			};
		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.MyTitle).equal(title);
			should(instance.MyContent).equal(content);
			instance.delete(next);
		});
	});

	it('should be able to create instance', function (next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.title).equal(title);
			should(instance.content).equal(content);
			instance.delete(next);
		});

	});

	it('should be able to fetch schema with post table', function (next) {
		connector.fetchSchema(function (err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.object;
			should(schema.objects.post.id).be.ok;
			should(schema.objects.post.title).be.ok;
			should(schema.objects.post.content).be.ok;
			should(schema.primary_keys.post).be.ok;
			next();
		});
	});

	it('should be able to find an instance by ID', function (next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();
			Model.find(id, function (err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.title).equal(title);
				should(instance2.content).equal(content);
				instance.delete(next);
			});

		});

	});

	it('should be able to find an instance by field value', function (next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var query = {title: title};
			Model.find(query, function (err, coll) {
				should(err).be.not.ok;
				var instance2 = coll[0];
				should(instance2).be.an.object;
				should(instance2.title).equal(title);
				instance.delete(next);
			});

		});

	});

	it('should be able to query', function (callback) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var options = {
				where: {title: title, content: {$like: 'Hello%'}},
				sel: {content: 1},
				order: {title: -1, content: 1},
				limit: 3,
				skip: 0
			};
			Model.query(options, function (err, coll) {
				should(err).be.not.ok;

				async.eachSeries(coll, function (obj, next) {
					should(obj.getPrimaryKey()).be.a.Number;
					should(obj.title).be.not.ok;
					should(obj.content).be.a.string;
					obj.remove(next);
				}, callback);
			});
		});

	});

	it('API-325: should be able to query with unsel', function (callback) {

		var Model = Arrow.Model.extend('post', {
			fields: {
				myTitle: {name: 'title', type: String},
				myContent: {name: 'content', type: String}
			},
			connector: 'appc.mysql'
		});
		var title = 'Test',
			content = 'Hello world',
			object = {
				myTitle: title,
				myContent: content
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var options = {
				where: {myContent: {$like: 'Hello%'}, myTitle: undefined},
				unsel: {myTitle: 1},
				order: {myTitle: -1, myContent: 1},
				limit: 3,
				skip: 0
			};
			Model.query(options, function (err, coll) {
				should(err).be.not.ok;

				async.eachSeries(coll, function (obj, next) {
					should(obj.getPrimaryKey()).be.a.Number;
					should(obj.myTitle).be.not.ok;
					should(obj.myContent).be.a.String;
					obj.remove(next);
				}, callback);
			});
		});

	});

	it('should be able to find all instances', function (next) {

		var posts = [
			{
				title: 'Test1',
				content: 'Hello world'
			},
			{
				title: 'Test2',
				content: 'Goodbye world'
			}];

		Model.deleteAll(function () {
			Model.create(posts, function (err, coll) {
				var keys = [];
				coll.forEach(function (post) {
					keys.push(post.getPrimaryKey());
				});

				Model.find(function (err, coll2) {
					should(err).be.not.ok;
					should(coll2.length).equal(coll.length);

					coll2.forEach(function (post, i) {
						should(post.getPrimaryKey()).equal(keys[i]);
					});

					Model.deleteAll(next);
				});

			});
		});

	});

	it('API-337: should be able to query with order', function (next) {

		var posts = [
			{
				title: 'Test1',
				content: 'Hello world'
			},
			{
				title: 'Test2',
				content: 'Goodbye world'
			},
			{
				title: 'Test3',
				content: 'Goodbye world'
			}
		];

		Model.deleteAll(function () {
			Model.create(posts, function (err, coll) {
				should(err).be.not.ok;

				Model.query({order: {title: 1}, limit: 2}, function (err, coll2) {
					should(err).be.not.ok;
					should(coll2[0].getPrimaryKey()).equal(coll[0].getPrimaryKey());
					should(coll2[1].getPrimaryKey()).equal(coll[1].getPrimaryKey());

					Model.query({order: {title: -1}}, function (err, coll2) {
						should(err).be.not.ok;
						should(coll2[0].getPrimaryKey()).equal(coll[2].getPrimaryKey());
						should(coll2[1].getPrimaryKey()).equal(coll[1].getPrimaryKey());

						Model.deleteAll(next);
					});
				});

			});
		});

	});

	it('API-281: should support paging', function (next) {

		var posts = [];
		for (var i = 1; i <= 15; i++) {
			posts.push({
				title: 'Test' + i,
				content: 'Hello world'
			});
		}

		Model.deleteAll(function (err) {
			should(err).be.not.ok;

			Model.create(posts, function (err) {
				should(err).be.not.ok;
				Model.findAll(function (err, coll) {
					should(err).be.not.ok;
					should(coll).be.an.object;

					Model.query({per_page: 1, page: 2}, function (err, coll2) {
						should(err).be.not.ok;
						should(coll2.getPrimaryKey()).equal(coll[1].getPrimaryKey());

						Model.query({skip: 1, limit: 1}, function (err, coll2) {
							should(err).be.not.ok;
							should(coll2.getPrimaryKey()).equal(coll[1].getPrimaryKey());

							Model.query({page: 2}, function (err, coll2) {
								should(err).be.not.ok;
								should(coll2[0].getPrimaryKey()).equal(coll[10].getPrimaryKey());

								Model.deleteAll(next);
							});
						});
					});
				});
			});
		});

	});

	it('should be able to update an instance', function (next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();
			Model.find(id, function (err, instance2) {
				should(err).be.not.ok;

				instance2.set('content', 'Goodbye world');
				instance2.save(function (err, result) {
					should(err).be.not.ok;

					should(result).be.an.object;
					should(result.getPrimaryKey()).equal(id);
					should(result.title).equal(title);
					should(result.content).equal('Goodbye world');
					instance.delete(next);
				});

			});

		});

	});

	it('API-377: should be able to query with just skip', function (callback) {
		Model.query({}, function (err, coll1) {
			should(err).be.not.ok;
			should(coll1).be.ok;
			Model.query({skip: 1}, function (err, coll2) {
				should(err).be.not.ok;
				should(coll2).be.ok;
				callback();
			});
		});
	});

	it('API-1043: should be able to query through views', function (callback) {
		var Names = connector.getModel('appc.mysql/hyphens'),
			title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};
		Model.create(object, function (err, instance) {
			Names.findAll(function (err, coll1) {
				should(err).be.not.ok;
				should(coll1).be.ok;
				callback();
			});
		});
	});

	it('API-731: should escape all fields in MySQL to avoid reserved word collisions', function (callback) {
		var keys = connector.escapeKeys(Model.payloadKeys());
		should(keys[0]).equal('`title`');
		callback();
	});

	it('should support different field types', function (callback) {
		var typeTesting = connector.getModel('appc.mysql/typeTesting');
		typeTesting.create({
			my_tinyint: 1,
			my_smallint: 2,
			my_mediumint: 3,
			my_bigint: 4,
			my_int: 5,
			my_integer: 6,
			my_float: 7.1,
			my_bit: 1,
			my_double: 9.2,
			my_binary: parseInt('110', 2),
			my_date: new Date(),
			my_datetime: new Date(),
			my_time: new Date(),
			my_year: 2015,
			my_varchar: '11',
			my_char: '   12',
			my_tinyblob: '13',
			my_blob: '14',
			my_mediumblob: '15',
			my_longblob: '16',
			my_tinytext: '17',
			my_mediumtext: '18',
			my_longtext: '19',
			my_text: '20'
		}, function (err, instance) {
			should(err).be.not.ok;
			should(instance.my_tinyint).equal(1);
			should(instance.my_tinyint).equal(1);
			should(instance.my_smallint).equal(2);
			should(instance.my_mediumint).equal(3);
			should(instance.my_bigint).equal(4);
			should(instance.my_int).equal(5);
			should(instance.my_integer).equal(6);
			should(instance.my_float).equal(7.1);
			should(instance.my_bit).equal(1);
			should(instance.my_double).equal(9.2);
			should(instance.my_binary).equal(6);
			should(instance.my_date).should.be.a.Date;
			should(instance.my_datetime).should.be.a.Date;
			should(instance.my_time).should.be.a.Date;
			should(instance.my_year).equal(2015);
			should(instance.my_varchar).equal('11');
			should(instance.my_char).equal('   12');
			should(instance.my_tinyblob).equal('13');
			should(instance.my_blob).equal('14');
			should(instance.my_mediumblob).equal('15');
			should(instance.my_longblob).equal('16');
			should(instance.my_tinytext).equal('17');
			should(instance.my_mediumtext).equal('18');
			should(instance.my_longtext).equal('19');
			should(instance.my_text).equal('20');

			typeTesting.findOne('this_will_not_work', function (err, result) {
				should(err.message).containEql("can't find primary key column");

				typeTesting.findAll(function (err, results) {
					should(err).be.not.ok;
					should(results).be.ok;

					results[0].set('my_text', '20v2');
					results[0].save(function (err) {
						should(err.message).containEql("can't find primary key column");

						results[0].remove(function (err) {
							should(err.message).containEql("can't find primary key column");
							callback();
						});
					});
				});
			});
		});
	});

});
