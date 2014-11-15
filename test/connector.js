var should = require('should'),
	async = require('async'),
	url = require('url'),
	APIBuilder = require('apibuilder'),
	Connector = require('../').create(APIBuilder),
	log = APIBuilder.createLogger({}, { name: 'api-connector-mysql TEST', useConsole: true, level: 'info' }),
	Loader = APIBuilder.Loader,
	_ = require('appc-cli-core').lodash,
	config = _.defaults({'username':'root','password':'','database':'test','host':'localhost'}, new Loader('../conf')),
	connector = new Connector(config),
	Model;


describe('Connector', function() {

	before(function(next) {
		// define your model
		Model = APIBuilder.Model.extend('post', {
			fields: {
				title: { type: String },
				content: { type: String }
			},
			connector: connector
		});

		should(Model).be.an.object;

		connector.connect(function(err) {
			Model.deleteAll(function(){
				next();
			});
		});
	});

	after(function(next) {
		Model.deleteAll(function(err) {
			if (err) {
				log.error(err.message);
			}
			connector.disconnect(next);
		});
	});

	it('should be able to fetch config', function(next) {
		connector.fetchConfig(function(err, config) {
			should(err).be.not.ok;
			should(config).be.an.object;
			should(Object.keys(config)).containEql('host');
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