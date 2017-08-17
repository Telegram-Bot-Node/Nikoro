const Plugin = require("./Plugin");

module.exports = class MasterPlugin extends Plugin {

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

    constructor(listener, pluginManager, config) {
        super(listener, config);

        this.pluginManager = pluginManager;
    }

    onCommand({message, command, args}, reply) {
        if (command !== "help") return;
        const availablePlugins = this.pluginManager.plugins
            .map(pl => pl.plugin)
            .filter(pl => pl.visibility !== Plugin.Visibility.HIDDEN);
        if (args.length === 0) {
            reply({
                type: "text",
                text: availablePlugins
                    .map(pl => `*${pl.name}*: ${pl.description}`)
                    .join("\n"),
                options: {
                    parse_mode: "markdown",
                    disable_web_page_preview: true
                }
            });
        } else {
            const pluginName = args[0].toLowerCase();
            const plugin = availablePlugins
                .filter(pl => pl.name.toLowerCase() === pluginName)[0];

            if (plugin)
                reply({
                    type: "text",
                    text: `*${plugin.name}* - ${plugin.description}\n\n${plugin.help}`,
                    options: {
                        parse_mode: "markdown",
                        disable_web_page_preview: true
                    }
                });
            else
                reply({
                    type: "text",
                    text: "No such plugin."
                });
        }
    }
};