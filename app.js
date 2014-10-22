var APIBuilder = require('apibuilder'),
	server = new APIBuilder(),
	Connector = require('./lib'),
	connector = new Connector();

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

var User = APIBuilder.createModel('user',{
	fields: {
		name: {type:'string', required: false, validator: /[a-zA-Z]{3,}/ }
	},
	connector: connector,	// a model level connector
	metadata: {
		mysql: {
			table: 'users'
		}
	}
});

// create some users programatically
var users = [
	{name: 'Jeff'},
	{name: 'Nolan'},
	{name: 'Neeraj'},
	{name: 'Tony'},
	{name: 'Rick'},
	{name: 'Kranthi'}
];
User.create(users, function(err,users){
	server.logger.info('Created some users',users);

	User.find({name:'Jeff'},function(err,results){
		console.log('Found Jeff? ',results && results.first());
	});
});


// add an authorization policy for all requests at the server log
server.authorization = APIKeyAuthorization;

// create a user api from a user model
server.addModel(User);

// start the server
server.start(function(){
	server.logger.info('server started on port', server.port);
});
