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


function PluginManager() {

    /*
        Performs all setup necessary to begin running a list of plugins.
        Includes loading, configuring and initialization.

        @param plugins - An array of plugin names corresponding to file
        names in the plugins directory.
    */

    PluginManager.prototype.runPlugins = function(plugins, botInfo, callback) {
        console.log(plugins.length + " Plugins activated");

        var loadedPlugins = PluginManager.prototype.loadPlugins(plugins, botInfo);
        console.log(loadedPlugins.length + " Plugins loaded and checked");
        this.loadedPlugins = loadedPlugins;

        console.log("Initializing Plugins");
        var self = this;
        PluginManager.prototype.initPlugins(loadedPlugins, botInfo).then(function(plugins){
            self.runningPlugins = plugins;
            callback(plugins);

        }, function(error){
            console.log("Error initializing plugins: " + error);
        });
    }

    PluginManager.prototype.initPlugins = function(loadedPlugins, botInfo) {
        var self = this;

        return new Promise( function(resolve, reject){
            
            util.inherits(PluginHelper, EventEmitter);
            self.PluginHelper = new PluginHelper();
            self.PluginHelper.db = new DBWrapper("PluginHelper");
            self.PluginHelper.botInfo = botInfo;

            self.PluginHelper.emit("init", function(){

                var toInitialize = loadedPlugins.slice(); // copy array
                var inittedPlugins = [];

                for (var idx in toInitialize) {
                    var loadedPlugin = toInitialize[idx];


                    loadedPlugin.emit("init",function(err, plugin) {
                        if (err) {
                            reject(err);
                        };
                        

                        inittedPlugins.push(plugin);

                        self.PluginHelper.addPlugin(plugin);

                        loadedPlugins.splice(0, 1); // remove plugin because it is already loaded
                        if (loadedPlugins.length == 0) {
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
        var loadedPlugins = [];
        var loadedPluginNames = [];

        for (var idx in plugins) {
            var pluginName = plugins[idx];
            var module = PluginManager.prototype.loadPlugin(pluginName, botInfo);

            if (module != null && PluginManager.prototype.validatePlugin(module)) {
                loadedPlugins.push(module);
                loadedPluginNames.push(pluginName);

            } else {
                console.log("\t"+ pluginName + " configuration failed. Plugin not activated.");
            }
        }

        this.loadedPluginNames = loadedPluginNames;
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

            util.inherits(module, EventEmitter); //ability to listen and emit events

            module = new module();
            module.properties.name = pluginName;

            module.botInfo = botInfo;
                    
            if(module.properties.databaseAccess)
            {
                module.db = new DBWrapper(module.properties.name);
            }

            if (module.listeners('init').length == 0) {
                module.addListener("init", function (done, db){
                    
                    done(null, module);
                });
            }

            if (module.listeners('stop').length == 0){
                module.addListener("stop", function (done){
                    done();
                });
            }
            //core handles plugin
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
            this.PluginHelper.emit.apply(this.PluginHelper, arguments);

            for (var idx in runningPlugins) {
                var runningPlugin = runningPlugins[idx];
                runningPlugin.emit.apply(runningPlugin, arguments); //emit all the params passed
            }
        } catch (ex) {
            console.log(ex);
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
                        self.runningPlugins = [];
                        self.PluginHelper.emit("stop",function(){
                            resolve();
                        })
                    }
                });
            }
        });
    }

    
}

module.exports = PluginManager;
