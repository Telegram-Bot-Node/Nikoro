var should = require('chai').should();
var PluginManager = require('../plugins');

describe('bot', function() {

	describe('PluginManager', function() {
		var plugins = new PluginManager();
		var runningPlugins;
		var loadedPlugins;

		beforeEach(function() {
			loadedPlugins = plugins.loadPlugins(["ping", "google", "set", "yt"]);
			runningPlugins = plugins.runPlugins(["ping", "google", "set", "yt"]);
		});

		it('should validate plugin configuration if required', function() {
			plugins.validatePlugin("ping").should.equal(true);
			plugins.validatePlugin("google").should.equal(true);
			plugins.validatePlugin("set").should.equal(true);
			plugins.validatePlugin("yt").should.equal(true);
		});

		it('should ignore unconfigured plugins', function() {
			loadedPlugins.should.have.length(2);
		});

		it('should not load missing or invalid plugin names', function() {
			var invalidPlugin = plugins.loadPlugin("this doesn't exist");
			should.equal(invalidPlugin, null);
			var randomPlugins = plugins.loadPlugins(["ping", "nonexistent", "set", "fake"]);
			randomPlugins.should.have.length(2);
		});

		it('should load all configured plugins', function() {
			plugins.loadedPluginNames[0].should.equal('ping');
			plugins.loadedPluginNames[1].should.equal('set');
		});

		it('should initialize all specified plugins', function() {
			runningPlugins.should.have.length(2);
		});

	});

	describe('message forwarding', function() {

		it('should handle incoming text messages');

		it('should forward all messages to enabled plugins');

		it('should handle reply callbacks from plugins');

		it('should handle text reply types');

		it('should handle audio reply types');

		it('should handle photo reply types');

		it('should handle status reply types');

	});

	describe('sending messages', function() {

		it('should send text messages to api');

		it('should send audio messages to api');

		it('should send photo messages to api');

		it('should send status messages to api');

	});

	describe('lifecycle', function() {

		it('should wait to safely stop all plugins before shutdown');

		it('should shutdown safely on exception');

		it('should shutdown safely when forced');

	});

})