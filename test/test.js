var request = require('supertest'),
	uglifyJS = require('uglify-js'),
	app = require('../app'),
	uglifyJS = require('uglify-js'),
	cleanCSS = require('clean-css'),
	coffeeScript = require('coffee-script');

request = request(app);

describe('POST /api', function() {
	describe('Content-Type: text/css', function() {
		var css = 'a { color: red; }\ndiv { color: black }';

		it('should return the same CSS that was passed in', function(done) {
			request.post('/api')
				.type('text/css')
				.send(css)
				.expect(200, css)
				.end(done);
		});

		it('should return the compressed CSS', function(done) {
			request.post('/api')
				.query({compress: true})
				.type('text/css')
				.send(css)
				.expect(200, cleanCSS.process(css))
				.end(done);
		});
	});

	describe('Content-Type: text/less', function() {
		var parser = new(require('less').Parser)();

		var less = '@red: #ff0000;\na { color: #00ff00;\n.red { color: @red; }}',
			cless,  /* Compiled */
			ccless; /* Compiled and compressed */

		parser.parse(less, function(e, tree) {
			cless = tree.toCSS();
			ccless = tree.toCSS({compress: true});
		});

		it('should return the LESS compiled to CSS', function(done) {
			request.post('/api')
				.type('text/less')
				.send(less)
				.expect(200, cless)
				.end(done);
		});

		it('should return the LESS compiled to CSS and compressed', function(done) {
			request.post('/api')
				.query({compress: true})
				.type('text/less')
				.send(less)
				.expect(200, ccless)
				.end(done);
		});
	});

	describe('Content-Type: text/javascript', function() {
		var js = 'var a = 123;\nfunction test(x) { return x; }';

		it('should return the same JavaScript that was passed in', function(done) {
			request.post('/api')
				.type('text/javascript')
				.send(js)
				.expect(200, js)
				.end(done);
		});

		it('should return the compressed JavaScript', function(done) {
			request.post('/api')
				.query({compress: true})
				.type('text/javascript')
				.send(js)
				.expect(200, uglifyJS.minify(js, {fromString: true}).code)
				.end(done);
		});
	});

	describe('Content-Type: text/coffeescript', function() {
		var cs = 'alert "I knew it!" if elvis?';

		it('should return the CoffeeScript compiled to regular JavaScript', function(done) {
			request.post('/api')
				.type('text/coffeescript')
				.send(cs)
				.expect(200, coffeeScript.compile(cs))
				.end(done);
		});

		it('should return the CoffeeScript compiled to regular JavaScript and compressed', function(done) {
			request.post('/api')
				.query({compress: true})
				.type('text/coffeescript')
				.send(cs)
				.expect(200, uglifyJS.minify(coffeeScript.compile(cs), {fromString: true}).code)
				.end(done);
		});
	});
});
