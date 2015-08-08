/*
	TODO: Header Documentation
*/

function PluginManager() {
	var runningPlugins;

	PluginManager.prototype.setupActivePlugins = function(activePlugins) {
		var runningPlugins = [];
		
		for (var idx in activePlugins) {
			var activePlugin = activePlugins[idx];
			var module = require('./plugins/' + activePlugin);
			var plugin = new module();

			if (typeof plugin.check == 'function') {

				if (plugin.check()) {
					runningPlugins.push(plugin);
				}
				else {
					console.log(activePlugin + "configuration failed. Plugin not acivated");
				}
			}
			else {
				runningPlugins.push(plugin);
			}
		}
		console.log(runningPlugins.length + " Plugins loaded");

		/* Initialize Plugins */
		for (var idx in runningPlugins) {
			var runningPlugin = runningPlugins[idx];
			runningPlugin.init();
		}
		console.log(runningPlugins.length + " Plugins initialized");
		this.runningPlugins = runningPlugins;
	}
}

module.exports = PluginManager;
