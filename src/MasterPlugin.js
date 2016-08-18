import Plugin from "./Plugin";
import Util from "./Util";

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
        const parts = Util.parseCommand(message.text, "help");
        if (parts) {
            let data = this.pluginManager.plugins.map(pl => pl.plugin).filter(pl => pl.visibility !== Plugin.Visibility.HIDDEN);
            if (parts.length === 1) {
                reply({
                    type: "text",
                    text: data.map(pl => `${pl.name}: ${pl.description}`).join("\n")
                });
            } else {
                const pluginName = parts[1].toLowerCase();
                let plugin = data.filter(pl => pl.name.toLowerCase() === pluginName)[0];
                reply({
                    type: "text",
                    text: `*${plugin.name}* - ${plugin.description}\n\n${plugin.help}`,
                    options: {
                        parse_mode: "Markdown"
                    }
                });
            }
        }
    }
}