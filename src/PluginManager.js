/*
    PluginManager

    An abstract class used to require an array of external modules
    or `plugins` specified by an array of module names. Each plugin
    is safely loaded, configured, initialized and shutdown by this class 
    before being used externally.

    Plugin Lifecycle
    1. Require plugin module
    2. Call `check()` method
    3. Call `init()` method
    4. Plugin now safely running
    5. Call `doStop()` method
    6. Plugin now safely stopped
*/

var EventEmitter = require('events').EventEmitter; //these two are used to add event capabilities to plugins
var util = require('util');

var PluginHelper = require('./PluginHelper');
var DBWrapper = require('./DBWrapper');

var logger = require('./Logger');
var log = logger.get("PluginManager");

function PluginManager() {

    /*
        Performs all setup necessary to begin running a list of plugins.
        Includes loading, configuring and initialization.

        @param plugins - An array of plugin names corresponding to file
        names in the plugins directory.
    */

    PluginManager.prototype.runPlugins = function(plugins, botInfo, callback) {
        log.info(plugins.length + " plugins activated");

        var loadedPlugins = PluginManager.prototype.loadPlugins(plugins, botInfo);
        log.info(loadedPlugins.length + " plugins imported and checked");

        log.info("Initializing plugins");
        var self = this;

        PluginManager.prototype.initPlugins(loadedPlugins, botInfo).then(function(plugins){
            log.info("All the plugins are initialized");
            self.runningPlugins = plugins;
            callback(plugins);
        }, function(error){
            log.error("Error initializing plugins: " + error);
        });
    }

    PluginManager.prototype.initPlugins = function(pluginsToInit, botInfo) {
        var self = this;

        log.verbose("initPlugins Initializing " + pluginsToInit.length + " plugins");
        
        return new Promise( function(resolve, reject){
            
            log.verbose("Loading PluginHelper");

            util.inherits(PluginHelper, EventEmitter);
            log.debug("PluginHelper inherited from EventEmitter");

            self.PluginHelper = new PluginHelper();
            log.debug("PluginHelper created");

            self.PluginHelper.db = new DBWrapper("PluginHelper");
            log.debug("PluginHelper now has a DBWrapper");

            self.PluginHelper.botInfo = botInfo; 
            log.debug("PluginHelper now has botInfo");

            log.verbose("Emitting init to PluginHelper");
            self.PluginHelper.emit("init", function(){
                log.info("PluginHelper is now initialized");

                var toInitialize = pluginsToInit.slice(); // copy array
                var inittedPlugins = [];

                log.verbose("Emitting init to all the plugins");
                for (var idx in toInitialize) {
                    var loadedPlugin = toInitialize[idx];

                    loadedPlugin.emit("init",function(err, plugin) {
                        if (err) {
                            reject(err);
                        };

                        inittedPlugins.push(plugin);
                        self.PluginHelper.addPlugin(plugin);

                        pluginsToInit.splice(0, 1); // remove plugin because it is already loaded
                        if (pluginsToInit.length == 0) {
                            log.verbose("All the plugins are initialized");
                            resolve(inittedPlugins);
                        }
                    });
                }
            });

        });
    }

    /*
        Loads a list of plugins by requiring the necessary module
        and checking that it is configured correctly.

        @param plugins - An array of plugin names corresponding to file
        names in the plugins directory.

        @return -  An array of loaded, configured plugin modules or functions.
    */
    PluginManager.prototype.loadPlugins = function(plugins, botInfo) {
        
        log.verbose("Loading " + plugins.length + " plugins");

        var loadedPlugins = [];

        for (var idx in plugins) {
            var pluginName = plugins[idx];
            log.verbose("Loading " + pluginName);

            var module = PluginManager.prototype.loadPlugin(pluginName, botInfo);
            log.verbose("Loaded " + pluginName);

            if (module != null && PluginManager.prototype.validatePlugin(module)) {
                loadedPlugins.push(module);
            } else {
                log.error("\t"+ pluginName + " configuration failed. Plugin not activated.");
            }
        }
        return loadedPlugins;
    }


    /*
        Loads an individual plugin by requiring the necessary module.

        @param plugin - A plugin name corresponding to a file
        name in the plugins directory.

        @return -  A new instance of the specified plugin.
    */
    PluginManager.prototype.loadPlugin = function(pluginName, botInfo) {
        try {
            
            var module = require('./../plugins/' + pluginName);
            log.debug("Required " + pluginName);
            util.inherits(module, EventEmitter); //ability to listen and emit events
            log.debug(pluginName + " inherited from EventEmitter");

            module = new module();
            log.debug(pluginName + " created");
            
            module.properties.name = pluginName;
            log.debug(pluginName + " named");

            module.botInfo = botInfo;
            log.debug(pluginName + " has botInfo");
            
            module.log = logger.get(pluginName);
            log.debug(pluginName + " has log");

            if(module.properties.databaseAccess)
            {
                module.db = new DBWrapper(module.properties.name);
                log.debug(pluginName + " has database");
            }

            if (module.listeners('init').length == 0) {
                log.debug(pluginName + " added init");
                module.addListener("init", function (done, db){
                    
                    done(null, module);
                });
            }

            if (module.listeners('stop').length == 0){
                log.debug(pluginName + " added stop");
                module.addListener("stop", function (done){
                    done();
                });
            }

            return module;
        } catch (err) {
            console.log("Error: " + err);
            return null;
        }
    }

    /*
        Validates an individual plugin by checking that all configuration
        requirements have been met. A plugin is considering configured correctly
        if its internal `check` method returns true, or if no such method exists.

        @param plugin - A plugin module or function.

        @return -  `true` if no configuration is needed, or if internal plugin 
        configuration returns `true`. Otherwise returns `false` and is ignored.
    */
    PluginManager.prototype.validatePlugin = function(plugin) {
        if (typeof plugin.check == 'function') {
            if (plugin.check()) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }



    PluginManager.prototype.emit = function() {

        var runningPlugins = this.runningPlugins;
        try {
            log.debug("Emitting event to PluginHelper");
            this.PluginHelper.emit.apply(this.PluginHelper, arguments);
            log.debug("Emitting event to plugins");
            for (var idx in runningPlugins) {
                var runningPlugin = runningPlugins[idx];
                runningPlugin.emit.apply(runningPlugin, arguments); //emit all the params passed
            }

        } catch (ex) {
            log.error(ex);
        }
    }

    /*
        Shuts down each running plugin module by calling plugin's
        internal `doStop` method.

        @param - done - A callback function to be performed when shutDown
        all plugins have safely prepared to terminate. 
    */
    PluginManager.prototype.shutDown = function(done) {

        var self = this;
        log.verbose("Emitting shutDown");

        return new Promise( function(resolve, reject){
            var existingPlugins = self.runningPlugins.slice(); // copy array
            var runningPlugins = self.runningPlugins;

            for (var idx in existingPlugins) {
                var runningPlugin = existingPlugins[idx];
                runningPlugin.emit("stop", function(err) {
                    if (err) {
                        reject(err);
                    };
                    runningPlugins.splice(0, 1); // remove plugin
                    if (runningPlugins.length == 0) {
                        log.verbose("Plugins shutted down");
                        self.runningPlugins = [];
                        log.verbose("Shutting down PluginHelper");
                        self.PluginHelper.emit("stop",function(){
                            log.verbose("PluginHelper shutted down");
                            resolve();
                        })
                    }
                });
            }
        });
    }

    
}

module.exports = PluginManager;
