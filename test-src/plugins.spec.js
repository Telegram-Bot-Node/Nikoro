'use strict';

import PluginManager from "../dist/PluginManager";
var Util = require('../dist/util');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should(),
    expect = chai.expect,
    assert = chai.assert;

describe('PluginManager', function () {
    var botInfo = {
        id: -1,
        first_name: "FakeBotForTest",
        username: "FakeBotForTest"
    };

    var pluginManager = new PluginManager(botInfo);
    var loadedPlugins, runningPlugins;
    var ping;

    beforeEach(function () {
        ping = pluginManager.loadPlugin("Ping");
    });

    describe('loading plugins', function () {
        before(function () {
            loadedPlugins = pluginManager.loadPlugins(["Ping"]);
        });

        it('should load Ping correctly', function() {
            return loadedPlugins.then(plugins => expect(plugins.length).to.equal(1));
        })

        it('should validate plugin configuration if required', function () {
            pluginManager.validatePlugin(ping).should.equal(true);
        });

        it.skip('should ignore unconfigured plugins', function () {
            loadedPlugins.should.have.length(2); // ping, set
        });

        // Skipped until we figure out how it's supposed to work
        it.skip('should load all configured plugins', function () {
            return loadedPlugins[0].properties.name.should.eventually.equal('ping');
        });

        it('should ignore missing or invalid plugin names', function () {
            var invalidPlugin = pluginManager.loadPlugin("this doesn't exist");
            expect(invalidPlugin).to.be.null;
/*
            var randomPlugins = pluginManager.loadPlugins(["Ping", "non-existent", "fakestPlugin"]);                
            return randomPlugins.then(plugins => assert(true));
*/
        });
    });

    describe.skip('initializing plugins', function () {
        var initSpy;
        var pingSpy;
        var runningPlugins = [];

        before(function () {
            initSpy = sinon.spy();
            pingSpy = sinon.spy();

            ping.on("init", pingSpy);

            runningPlugins = pluginManager.initPlugins([ping, set]).then(function (plugins) {
                runningPlugins = plugins;
                initSpy();
            });
        });

        it('should initialize all loaded plugins', function () {
            runningPlugins.should.have.length(2);
            initSpy.should.have.been.called;
            pingSpy.should.have.been.called;
        });
    });

    describe('message forwarding', function () {
        var pingSpy;
        var message = {
            "text": "ping",
            "chat": { "id": -1 }
        };
        var callback = sinon.spy();
        var newManager = new PluginManager();

        before(function (done) {
            this.timeout(5 * 1000);
            return new Promise(function(resolve, reject) {
                newManager
                    .loadPlugins(["Ping"])
                    .then(() => newManager.startPlugins())
                    .then(() => newManager.emit("text", {text: "ping"}, () => done()))
            });
            /*
            pluginManager.runPlugins(["ping"], function (plugins) {

                pingSpy = sinon.spy();

                pluginManager.runningPlugins[0].on("text", pingSpy);

                pluginManager.emit("text", message, callback);
                pluginManager.emit("text", message, function () {
                    done();
                });
            });
            */
        });

        it.skip('should forward messages to each plugin', function () {
            pingSpy.should.have.been.calledWith(message, callback);
        });

        it.skip('should handle reply callbacks from plugins', function () {
            callback.should.have.been.calledOnce;
        });

        /*it('should handle text reply types'); //pending
         it('should handle audio reply types'); //pending
         it('should handle photo reply types'); //pending
         it('should handle status reply types'); //pending*/
    });

    describe.skip('stop', function () {
        var pingSpy;
        var callback = sinon.spy();

        before(function () {
            pluginManager.runPlugins(["ping"], function () {
                pingSpy = sinon.spy();

                ping = pluginManager.runningPlugins[0].on("stop", pingSpy);

                pluginManager.shutDown().then(function () {
                    callback();
                    done();
                });
            });
        });

        it('should ask plugins to shutdown safely', function () {
            pingSpy.should.have.been.calledOnce;
        });

        it('should wait to safely stop all plugins before shutdown', function () {
            callback.should.have.been.calledOnce;
        });
    });
});

describe('Util Module', function () {

    describe('ParseCommand', function () {
        var message1 = "/command arg1 arg2 arg3"; //regular command
        var message2 = "/command arg1 - arg2 arg2"; //command with args separated by "-"
        var message3 = "command arg1 arg2"; //not a command, not prefixed by / or !
        var message4 = "/command only one arg very long"; //command with one long arg

        it('should parse commands correctly', function () {

            Util.parseCommand(message1, ["command"]).length.should.equal(["command", "arg1", "arg2", "arg3"].length);
            (Util.parseCommand(message1, ["anotherCommand"]) == null).should.be.true;

            Util.parseCommand(message2, ["command"], { splitBy: "-" }).length.should.equal(["command", "arg1", "arg2 arg2"].length);

            (Util.parseCommand(message3, ["command"]) == null).should.be.true;

            Util.parseCommand(message4, ["command"], { joinParams: true }).length.should.equal(["command", "only one arg very long"].length);
        });
    });
});