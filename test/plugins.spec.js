var PluginManager = require('../src/pluginManager');
var Util = require('../src/util');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should();

describe('PluginManager', function() {

    var botInfo = {
        id: -1,
        first_name: "FakeBotForTest",
        username: "FakeBotForTest"
    }


    var pluginManager = new PluginManager(botInfo);
    var loadedPlugins, runningPlugins;
    var ping, google, set, yt;

    beforeEach(function() {
        ping = pluginManager.loadPlugin("ping");
        google = pluginManager.loadPlugin("google");
        set = pluginManager.loadPlugin("set");
        yt = pluginManager.loadPlugin("youtube");
    });

    describe('loading plugins', function() {
        before(function() {
            loadedPlugins = pluginManager.loadPlugins(["ping", "google", "set", "youtube"]);
        });

        it('should validate plugin configuration if required', function() {
            pluginManager.validatePlugin(ping).should.equal(true);
            pluginManager.validatePlugin(google).should.equal(false); // requires an api key
            pluginManager.validatePlugin(set).should.equal(true);
            pluginManager.validatePlugin(yt).should.equal(false); // requires an api key
        });

        it('should ignore unconfigured plugins', function() {
            loadedPlugins.should.have.length(2); // ping, set
        });

        it('should load all configured plugins', function() {
            loadedPlugins[0].properties.name.should.equal('ping');
            loadedPlugins[1].properties.name.should.equal('set');
        });

        it('should ignore missing or invalid plugin names', function() {
            var invalidPlugin = pluginManager.loadPlugin("this doesn't exist");
            should.equal(invalidPlugin, null);

            var randomPlugins = pluginManager.loadPlugins(["ping", "non-existent", "set", "fakestPlugin"]);
            randomPlugins.should.have.length(2);
        });
    });

    describe('initializing plugins', function() {
        var initSpy;
        var pingSpy,setSpy;
        var runningPlugins = [];

        before(function() {
            initSpy = sinon.spy();
            pingSpy = sinon.spy();
            setSpy = sinon.spy();

            ping.on("init", pingSpy);
            set.on("init", setSpy);

            runningPlugins = pluginManager.initPlugins([ping, set]).then(function(plugins){
                runningPlugins = plugins;
                initSpy();
            });
        });

        it('should initialize all loaded plugins', function() {
            runningPlugins.should.have.length(2);
            initSpy.should.have.been.called;
            setSpy.should.have.been.called;
            pingSpy.should.have.been.called;
        });

    });

    describe('message forwarding', function() {
        var pingSpy, setSpy;
        var message = {
            "text": "ping",
            "chat": { "id": -1 }
        };
        var callback = sinon.spy();

        before(function(done) {
            pluginManager.runPlugins(["ping", "google", "set", "youtube"], function(plugins){

                pingSpy = sinon.spy();
                setSpy = sinon.spy();

                pluginManager.runningPlugins[0].on("text", pingSpy);
                pluginManager.runningPlugins[1].on("text", setSpy);
                
                pluginManager.emit("text", message, callback);
                pluginManager.emit("text", message, function(){
                    done();
                });                
            });
        });

        it('should forward messages to each plugin', function() {
            pingSpy.should.have.been.calledWith(message, callback);
            setSpy.should.have.been.calledWith(message, callback);
        });

        it('should handle reply callbacks from plugins', function() {
            callback.should.have.been.calledOnce;
        });

        /*it('should handle text reply types'); //pending

        it('should handle audio reply types'); //pending

        it('should handle photo reply types'); //pending

        it('should handle status reply types'); //pending*/

    });

    describe('stop', function() {
        var pingSpy, setSpy;
        var callback = sinon.spy();

        before(function(done) {
            pluginManager.runPlugins(["ping", "google", "set", "youtube"], function(){
                pingSpy = sinon.spy();
                setSpy = sinon.spy();

                ping = pluginManager.runningPlugins[0].on("stop", pingSpy);
                set = pluginManager.runningPlugins[1].on("stop", setSpy);

                pluginManager.shutDown().then(function(){
                    callback();
                    done();
                });
                
            });
        });

        it('should ask plugins to shutdown safely', function() {
            pingSpy.should.have.been.calledOnce;
            setSpy.should.have.been.calledOnce;
        });

        it('should wait to safely stop all plugins before shutdown', function() {
            callback.should.have.been.calledOnce;
        });

    });

});


describe('Util Module', function() {

     describe('ParseCommand', function() {
        var message1 = "/command arg1 arg2 arg3"; //regular command
        var message2 = "/command arg1 - arg2 arg2"; //command with args separated by "-" 
        var message3 = "command arg1 arg2"; //not a command, not prefixed by / or !
        var message4 = "/command only one arg very long"; //command with one long arg

        it('should parse commands correctly', function() {

            Util.parseCommand(message1, ["command"]).length.should.equal(["command","arg1","arg2","arg3"].length);
            (Util.parseCommand(message1, ["anotherCommand"]) == null).should.be.true;

            Util.parseCommand(message2, ["command"],{splitBy: "-"}).length.should.equal(["command", "arg1", "arg2 arg2"].length);
            
            (Util.parseCommand(message3, ["command"]) == null).should.be.true;

            Util.parseCommand(message4, ["command"], {joinParams: true}).length.should.equal(["command", "only one arg very long"].length);
        });

     });

});