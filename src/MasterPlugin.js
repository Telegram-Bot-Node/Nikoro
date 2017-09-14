const Plugin = require("./Plugin");

module.exports = class MasterPlugin extends Plugin {

    static get plugin() {
        return {
            name: "MasterPlugin",
            description: "",
            help: "This plugin has access to PluginManager and will perform all the 'meta'/'super' actions.",

            type: Plugin.Type.SPECIAL,
            visibility: Plugin.Visibility.HIDDEN
        };
    }

    constructor(listener, pluginManager, config) {
        super(listener, config);

        this.pluginManager = pluginManager;
    }

    onCommand({message, command, args}) {
        if (command !== "help") return;
        const availablePlugins = this.pluginManager.plugins
            .map(pl => pl.plugin)
            .filter(pl => pl.visibility !== Plugin.Visibility.HIDDEN);
        if (args.length === 0) {
            this.sendMessage(
                message.chat.id,
                availablePlugins
                    .map(pl => `*${pl.name}*: ${pl.description}`)
                    .join("\n"),
                {
                    parse_mode: "markdown",
                    disable_web_page_preview: true
                }
            );
        } else {
            const pluginName = args[0].toLowerCase();
            const plugin = availablePlugins
                .filter(pl => pl.name.toLowerCase() === pluginName)[0];

            if (plugin)
                this.sendMessage(
                    message.chat.id,
                    `*${plugin.name}* - ${plugin.description}\n\n${plugin.help}`,
                    {
                        parse_mode: "markdown",
                        disable_web_page_preview: true
                    }
                );
            else
                this.sendMessage(message.chat.id, "No such plugin.");
        }
    }
};