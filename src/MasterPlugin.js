import Plugin from "./Plugin";

export default class MasterPlugin extends Plugin {

    static get plugin() {
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

    onCommand({message, command, args}, reply) {
        if (command !== "help") return;
        const data = this.pluginManager.plugins
            .map(pl => pl.plugin)
            .filter(pl => pl.visibility !== Plugin.Visibility.HIDDEN);
        if (args.length === 0) {
            reply({
                type: "text",
                text: data
                    .map(pl => `${pl.name}: ${pl.description}`)
                    .join("\n")
            });
        } else {
            const pluginName = args[0].toLowerCase();
            const plugin = data
                .filter(pl => pl.name.toLowerCase() === pluginName)[0];
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