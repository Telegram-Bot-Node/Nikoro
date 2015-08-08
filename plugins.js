/*
	TODO: Header Documentation
*/

function PluginManager() {

	PluginManager.prototype.runPlugins = function(plugins) {
		var loadedPlugins = PluginManager.prototype.loadPlugins(plugins);
		console.log(loadedPlugins.length + " Plugins loaded");

		var runningPlugins = PluginManager.prototype.initializePlugins(loadedPlugins);
		console.log(runningPlugins.length + " Plugins initialized");

		return runningPlugins;
	}

	PluginManager.prototype.loadPlugins = function(plugins) {
		var loadedPlugins = [];
		var loadedPluginNames = [];

		for (var idx in plugins) {
			var plugin = plugins[idx];
			var module = PluginManager.prototype.loadPlugin(plugin);

			if (module != null && PluginManager.prototype.validatePlugin(module)) {
				loadedPlugins.push(module);
				loadedPluginNames.push(plugin);
			}
			else {
				console.log(plugin + " configuration failed. Plugin not activated");
			}
		}

		this.loadedPluginNames = loadedPluginNames;
		return loadedPlugins;
	}

	PluginManager.prototype.initializePlugins = function(plugins) {
		var intializedPlugins = [];

		for (var idx in plugins) {
			var plugin = plugins[idx];
			plugin.init();
			intializedPlugins.push(plugin);
		}

		return intializedPlugins;
	}

	PluginManager.prototype.loadPlugin = function(plugin) {
		try {
			var module = require('./plugins/' + plugin);
			return new module();
		}
		catch(err) {
			console.log("Error: Module path not found");
			return null;
		}
	}

	PluginManager.prototype.validatePlugin = function(plugin) {
		if (typeof plugin.check == 'function') {
			if (plugin.check()) {
				return true;
			}
			else {
				return false;
			}
		}
		return true;
	}
}

module.exports = PluginManager;
