var APIBuilder = require('apibuilder'),
	server = new APIBuilder();

// lifecycle examples
server.on('starting', function(){
	server.logger.info('server is starting!');
});

server.on('started', function(){
	server.logger.info('server started!');
});

//--------------------- implement authorization ---------------------//

// fetch our configured apikey
var apikey = server.get('apikey');
server.logger.info('APIKey is:',apikey);

function APIKeyAuthorization(req, resp, next) {
	if (!apikey) return next();
	if (req.headers['apikey']) {
		var key = req.headers['apikey'];
		if (key === apikey) {
			return next();
		}
	}
	resp.status(401);
	return resp.json({
		id: "com.appcelerator.api.unauthorized",
		message: "Unauthorized",
		url: ""
	});
}

//--------------------- simple user model ---------------------//

var Post = APIBuilder.createModel('post',{
	fields: {
		title: { type: String },
		content: { type: String }
	},
	connector: 'appc.mysql',
	metadata: {
		mysql: {
			table: 'post'
		}
	}
});

// create some posts programatically
var posts = [
	{title: 'A journey through time', content: 'take a journey'},
	{title: 'The Bible', content: 'In the beginning, God created the heavens and the earth.'}
];
Post.create(posts, function(err,posts){
	if (err) { return server.logger.error(err); }
	server.logger.info('Created some posts',posts);

	Post.find({title:'The Bible'},function(err,results){
		console.log('Found The Bible? ',results && results.first());
	});
});


// add an authorization policy for all requests at the server log
server.authorization = APIKeyAuthorization;

// create a post api from a post model
server.addModel(Post);

// start the server
server.start(function(err){
	if (err) { server.logger.fatal(err); }
	server.logger.info('server started on port', server.port);
});
