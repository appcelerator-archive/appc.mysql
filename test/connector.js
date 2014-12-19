var should = require('should'),
	async = require('async'),
	_ = require('appcelerator').lodash,
	APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder(),
	log = APIBuilder.createLogger({}, { name: 'api-connector-mysql TEST', useConsole: true, level: 'info' }),
	connector = server.getConnector('appc.mysql'),
	Model;

describe('Connector', function() {

	before(function(next) {
		// define your model
		Model = APIBuilder.Model.extend('post', {
			fields: {
				title: { type: String },
				content: { type: String }
			},
			connector: 'appc.mysql'
		});

		should(Model).be.an.object;

		Model.deleteAll(function() {
			next();
		});
	});

	after(function(next) {
		Model.deleteAll(function(err) {
			if (err) {
				log.error(err.message);
			}
			next();
		});
	});

	it('should be able to fetch schema', function(next) {
		connector.fetchSchema(function(err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.object;
			next();
		});
	});

	it('should create models from tables', function() {
		var SuperPost = connector.getModel('appc.mysql/super_post');
		should(SuperPost).be.ok;
	});

	it('should be able to use named fields', function(next) {
		var Model = APIBuilder.Model.extend('post', {
				fields: {
					MyTitle: { name: 'title', type: String },
					MyContent: { name: 'content', type: String }
				},
				connector: 'appc.mysql'
			}),
			title = 'Test',
			content = 'Hello world',
			object = {
				MyTitle: title,
				MyContent: content
			};
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.MyTitle).equal(title);
			should(instance.MyContent).equal(content);
			Model.query({
				where: {
					MyTitle: 'Test'
				}
			}, function(err, coll) {
				should(err).be.not.ok;
				should(coll.length).be.greaterThan(0);				
				instance.delete(next);
			});
		});
	});

	it('should be able to ignore fields absent from schema', function(next) {
		var Model = APIBuilder.Model.extend('post', {
				fields: {
					MyTitle: { name: 'title', type: String },
					MyContent: { name: 'content', type: String },
					MyCustomField: { type: String }
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
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.MyTitle).equal(title);
			should(instance.MyContent).equal(content);
			instance.delete(next);
		});
	});

	it('should be able to create instance', function(next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;
			should(instance.getPrimaryKey()).be.a.Number;
			should(instance.title).equal(title);
			should(instance.content).equal(content);
			instance.delete(next);
		});

	});

	it('should be able to fetch schema with post table', function(next) {
		connector.fetchSchema(function(err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.object;
			should(schema.objects.post.id).be.ok;
			should(schema.objects.post.title).be.ok;
			should(schema.objects.post.content).be.ok;
			should(schema.primary_keys.post).be.ok;
			next();
		});
	});

	it('should be able to find an instance by ID', function(next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.title).equal(title);
				should(instance2.content).equal(content);
				instance.delete(next);
			});

		});

	});

	it('should be able to find an instance by field value', function(next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var query = { title: title };
			Model.find(query, function(err, coll) {
				should(err).be.not.ok;
				var instance2 = coll[0];
				should(instance2).be.an.object;
				should(instance2.title).equal(title);
				instance.delete(next);
			});

		});

	});

	it('should be able to query', function(callback) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var options = {
				where: { content: { $like: 'Hello%' } },
				sel: { content: 1 },
				order: { title: -1, content: 1 },
				limit: 3,
				skip: 0
			};
			Model.query(options, function(err, coll) {
				should(err).be.not.ok;

				async.eachSeries(coll, function(obj, next) {
					should(obj.getPrimaryKey()).be.a.Number;
					should(obj.title).be.not.ok;
					should(obj.content).be.a.string;
					obj.remove(next);
				}, callback);
			});
		});

	});

	it('should be able to find all instances', function(next) {

		var posts = [
			{
				title: 'Test1',
				content: 'Hello world'
			},
			{
				title: 'Test2',
				content: 'Goodbye world'
			}];

		Model.create(posts, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(posts.length);

			var keys = [];
			coll.forEach(function(post) {
				keys.push(post.getPrimaryKey());
			});

			Model.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).equal(coll.length);

				var array = [];

				coll2.forEach(function(post, i) {
					should(post.getPrimaryKey()).equal(keys[i]);
					array.push(post);
				});

				async.eachSeries(array, function(post, next_) {
					should(post).be.an.object;
					post.delete(next_);
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('should be able to update an instance', function(next) {

		var title = 'Test',
			content = 'Hello world',
			object = {
				title: title,
				content: content
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;

				instance2.set('content', 'Goodbye world');
				instance2.save(function(err, result) {
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

});