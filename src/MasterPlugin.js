import Plugin from "./Plugin";

export default class MasterPlugin extends Plugin {

    get plugin() {
        return {
            name: "MasterPlugin",
            description: "",
            help: "This plugin has access to PluginManager and will perform all the 'meta'/'super' actions.",

            type: Plugin.Type.SPECIAL,
            visibility: Plugin.Visibility.HIDDEN,

            needs: {
                database: true,
                utils: true
            }
        };
    }

    constructor(listener, pluginManager) {
        super(listener);

        this.pluginManager = pluginManager;
    }

    onText(message, reply) {
        if (message.text === "/help") {
            // For each plugin, fetch just the metadata.
            let plugins = this.pluginManager.plugins
                .map(pl => pl.plugin)
                .filter(item => item.visibility !== Plugin.Visibility.HIDDEN);
            console.log(plugins);
            reply({
                type: "text",
                text: plugins.map(item => `${item.name} - ${item.help}`).join('\n')
            });
            return;
        }
    }
}