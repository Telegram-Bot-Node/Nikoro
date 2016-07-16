/*
    PluginManager

    An abstract class used to require an array of external modules
    or `plugins` specified by an array of module names. Each plugin
    is safely loaded, configured, initialized and shutdown by this class
    before being used externally.

    Plugin Lifecycle
    1. Require plugin module
    2. Call `check()` method
    3. Call `start()` method
    4. Plugin now safely running
    5. Call `stop()` method
    6. Plugin now safely stopped
*/

import Logger from "./Logger";
import MasterPlugin from "./MasterPlugin";

import {EventEmitter} from "events";

export default class PluginManager {

    constructor(pluginNames) {
        this.log = Logger.get("PluginManager");

        this.pluginNames = pluginNames;
        this.plugins = [];

        this.emitter = new EventEmitter();

        this.masterPlugin = new MasterPlugin(this.emitter, this);
        this.addPlugin(this.masterPlugin);
    }

    loadPlugin(pluginName) {
        return new Promise(
            (resolve, reject) => {
                // default because of es6 classes
                let ThisPlugin = require('./plugins/' + pluginName).default;

                this.log.debug("Required " + pluginName);

                let loadedPlugin = new ThisPlugin(this.emitter);
                this.log.debug(`Created ${pluginName}.`);

                if (!this.validatePlugin(loadedPlugin))
                    return reject(`Invalid ${pluginName}.`);

                this.log.verbose(`Validated ${pluginName}.`);
                resolve(loadedPlugin);
            }
        );
    }

    addPlugin(loadedPlugin) {
        if (loadedPlugin === null)
            // todo: find out plugin name
            return Promise.reject("Plugin configuration failed. Plugin not activated.");

        this.plugins.push(loadedPlugin);
        this.log.verbose(`Added ${loadedPlugin.plugin.name}.`);
        return Promise.resolve();
    }

    loadAndAdd(pluginName) {
        this.log.verbose(`Loading and adding ${pluginName}...`);

        return this.loadPlugin(pluginName)
        .then(loadedPlugin => this.addPlugin(loadedPlugin));
    }

    loadPlugins(pluginNames) {
        this.log.verbose(`Loading and adding ${pluginNames.length} plugins...`);

        for (var pluginName of pluginNames) {
            this.loadAndAdd(pluginName);
        }
        return Promise.resolve();
    }

    startPlugins() {
        return Promise.all(this.plugins.map(pl => pl.start()));
    }

    stopPlugins() {
        return Promise.all(this.plugins.map(pl => pl.stop()));
    }

    emit(event, message, callback) {
        this.emitter.emit(event, message, callback);
    }

    validatePlugin(loadedPlugin) {
        return loadedPlugin.check();
    }

}

