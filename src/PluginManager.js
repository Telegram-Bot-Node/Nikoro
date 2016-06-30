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



import Logger from "./Logger";

export default class PluginManager {

    constructor(pluginNames) {
        this.pluginNames = pluginNames;
        this.loadedPlugins = [];

        this.log = Logger.get("PluginManager");
    }

    loadPlugin(pluginName) {
        try {
            let plugin = require('./plugins/' + pluginName).default;

            this.log.debug("Required " + pluginName);

            let loadedPlugin = new plugin();
            this.log.debug(pluginName + " created");

            if(this.validatePlugin(loadedPlugin))
                return loadedPlugin;
            else
                return null;

        } catch (err) {
            this.log.error(err);
            return null;
        }
    };

    loadPlugins(pluginNames) {
        return new Promise(
            (resolve, reject) => {
                this.log.verbose("Loading " + pluginNames.length + " plugins");

                for (var pluginName of pluginNames) {
                    this.log.verbose("Loading " + pluginName);

                    let loadedPlugin = this.loadPlugin(pluginName);

                    if (loadedPlugin != null) {
                        this.log.verbose("Loaded " + pluginName);
                        this.loadedPlugins.push(loadedPlugin);
                    } else {
                        this.log.error("\t"+ pluginName + " configuration failed. Plugin not activated.");
                    }
                }
                resolve();
            }
        );
    };

    startPlugins() {
        return new Promise(
            (resolve, reject) => {
                Promise.all(this.loadedPlugins.map(pl => pl.start()))
                .then(() => {
                    resolve();
                })
            }
        );
    }

    stopPlugins() {
        return new Promise(
            (resolve, reject) => {
                Promise.all(this.loadedPlugins.map(pl => pl.stop()))
                .then(() => {
                    resolve();
                })
            }
        );
    }

    emit(event, message, callback) {
        for (var plugin of this.loadedPlugins) {
            plugin.emit(event, message, callback);
        }
    }
    validatePlugin(loadedPlugin){
        return loadedPlugin.check();
    };

}

