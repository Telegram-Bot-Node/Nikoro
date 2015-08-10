var PluginManager = require('../plugins');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should();

describe('PluginManager', function() {
		var plugins = new PluginManager();
		var runningPlugins, runningPlugins;
		var ping, google, set, yt;
		var pingSpy, googleSpy, setSpy, ytSpy;

		before(function() {
			ping = plugins.loadPlugin("ping");
			google = plugins.loadPlugin("google");
			set = plugins.loadPlugin("set");
			yt = plugins.loadPlugin("yt");
		})

		describe('loading plugins', function() {
			before(function() {
				loadedPlugins = plugins.loadPlugins(["ping", "google", "set", "yt"]);
				runningPlugins = plugins.initializePlugins(loadedPlugins);
			});

			it('should validate plugin configuration if required', function() {
				plugins.validatePlugin(ping).should.equal(true);
				plugins.validatePlugin(google).should.equal(false); // requires an api key
				plugins.validatePlugin(set).should.equal(true);
				plugins.validatePlugin(yt).should.equal(false); // requires an api key
			});

			it('should ignore unconfigured plugins', function() {
				loadedPlugins.should.have.length(2); // ping, set
			});

			it('should load all configured plugins', function() {
				plugins.loadedPluginNames[0].should.equal('ping');
				plugins.loadedPluginNames[1].should.equal('set');
			});

			it('should ignore missing or invalid plugin names', function() {
				var invalidPlugin = plugins.loadPlugin("this doesn't exist");
				should.equal(invalidPlugin, null);

				var randomPlugins = plugins.loadPlugins(["ping", "nonexistent", "set", "fake"]);
				randomPlugins.should.have.length(2);
			});
		});

		describe('initializing plugins', function() {
			before(function() {
				pingSpy = sinon.spy(ping, "init");
				googleSpy = sinon.spy(google, "init");
				setSpy = sinon.spy(set, "init");
				ytSpy = sinon.spy(yt, "init");

				plugins.initializePlugins([ping, google, set, yt]);
			});

			it('should initialize all loaded plugins', function() {
				runningPlugins.should.have.length(2);

				pingSpy.should.have.been.called;
				googleSpy.should.have.been.called;
				setSpy.should.have.been.called;
				ytSpy.should.have.been.called;
			});
		});

		describe('message forwarding', function() {

			it('should forward messages to each plugin');

			it('should forward all messages to enabled plugins');

			it('should handle reply callbacks from plugins');

			it('should handle text reply types');

			it('should handle audio reply types');

			it('should handle photo reply types');

			it('should handle status reply types');

		});

	});
