var express = require('express'),
	http = require('http'),
	path = require('path'),
	less = require('less');

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.compress());
	// app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

app.configure('production', function() {
});

/* 
 * Middleware for parsing raw body data, Express's bodyParser only parses
 * incoming data if Content-Type is set to either of:
 *
 * 1. application/x-www-form-urlencoded
 * 2. application/json
 * 3. multipart/form-data
 */
var rawBody = function(req, res, next) {
	var data = '';

	req.setEncoding('utf-8');

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end', function() {
		req.rawBody = data;
		next();
	});
};

app.get('/', function(req, res) {
	res.render('index', { title: 'Webassets' });
});

app.post('/api', rawBody, function(req, res) {
	var response = 'WHY U NO GIVE ME SOMETHING?!';

	if (req.is('text/css')) {
		res.type('text/css');
		response = req.rawBody;
	}

	if (req.is('text/less')) {
		var parser = new(less.Parser)();

		parser.parse(req.rawBody, function(e, tree) {
			res.type('text/css');
			response = tree.toCSS({compress: req.query.compress || false});
		});
	}

	res.send(response);
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
