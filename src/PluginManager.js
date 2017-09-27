const Log = require("./Log");
const MasterPlugin = require("./MasterPlugin");
const Plugin = require("./Plugin");
const Util = require("./Util");
const {EventEmitter} = require("events");

// A small utility functor to find a plugin with a given name
const nameMatches = targetName => pl => pl.plugin.name.toLowerCase() === targetName.toLowerCase();

module.exports = class PluginManager {

    constructor(bot, config, auth) {
        this.bot = bot;
        this.log = Log.get("PluginManager", config);
        this.auth = auth;
        this.plugins = [];
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(Infinity);

        this.masterPlugin = new MasterPlugin(this.emitter, this, config);
        this.masterPlugin.sendMessage = this.bot.sendMessage.bind(this.bot); // Dirty patch
        this.addPlugin(this.masterPlugin);

        this.config = config;

        const events = [
            "text", "audio", "document", "photo", "sticker", "video", "voice", "contact", "location",
            "inline_query", "chosen_inline_request",
            "new_chat_participant", "left_chat_participant", "group_chat_created",
            "new_chat_title", "new_chat_photo", "delete_chat_photo"
        ];
        // Registers a handler for every Telegram event.
        // It runs the message through the proxy and forwards it to the plugin manager.
        for (const eventName of events) {
            bot.on(
                eventName,
                message => {
                    this.parseEnableDisable(message);
                    Promise.all(
                        this.plugins
                            .filter(plugin => (plugin.plugin.type & Plugin.Type.PROXY) === Plugin.Type.PROXY)
                            .map(plugin => plugin.proxy(eventName, message))
                        )
                       .then(() => this.emit(
                            eventName,
                            message
                        ))
                        .catch(err => {
                            if (err) this.log.error("Message rejected with error", err);
                        });
                }
            );
        }
    }

    parseEnableDisable(message) {
        // Hardcoded hot-swap plugin
        if (!message.text) return;
        const parts = Util.parseCommand(
            message.text,
            [
                "enable",
                "disable"
            ],
            {
                overrideDeprecation: true
            }
        );
        if (!parts) return;
        if (!this.auth.isAdmin(message.from.id)) return;
        // Syntax: /("enable"|"disable") pluginName [targetChat|"chat"]
        // The string "chat" will enable the plugin in the current chat.
        let [command, pluginName, targetChat] = parts;
        if (targetChat === "chat") targetChat = message.chat.id;
        targetChat = Number(targetChat);
        // Checks if it is already in this.plugins
        const isGloballyEnabled = this.plugins.some(nameMatches(pluginName));
        let response;
        switch (command) {
        case "enable":
            if (targetChat) {
                // Enable it if necessary
                let status = true;
                if (!isGloballyEnabled)
                    status = this.loadAndAdd(pluginName);
                if (status) {
                    const plugin = this.plugins.find(nameMatches(pluginName));
                    plugin.blacklist.delete(targetChat);
                    response = `Plugin enabled successfully for chat ${targetChat}.`;
                } else {
                    response = "Couldn't load plugin.";
                }
            } else {
                if (isGloballyEnabled) {
                    response = "Plugin already enabled.";
                } else {
                    this.log.info(`Enabling ${pluginName} from message interface`);
                    const status = this.loadAndAdd(pluginName);
                    response = status ? "Plugin enabled successfully." : "An error occurred.";
                }
            }
            break;
        case "disable":
            if (targetChat) {
                if (isGloballyEnabled) {
                    const plugin = this.plugins.find(nameMatches(pluginName));
                    plugin.blacklist.add(targetChat);
                    response = `Plugin disabled successfully for chat ${targetChat}.`;
                } else {
                    response = "Plugin isn't enabled.";
                }
            } else {
                if (isGloballyEnabled) {
                    const outcome = this.removePlugin(pluginName);
                    response = outcome ? "Plugin disabled successfully." : "An error occurred.";
                } else {
                    response = "Plugin already disabled.";
                }
            }
            break;
        default:
            break;
        }
        this.bot.sendMessage(message.chat.id, response);
    }

    // Instantiates the plugin.
    // Returns the plugin itself.
    loadPlugin(pluginName) {
        const ThisPlugin = require(__dirname + '/plugins/' + pluginName);

        this.log.debug(`Required ${pluginName}`);

        const loadedPlugin = new ThisPlugin(this.emitter, this.bot);

        for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(this.bot))) {
            if (typeof this.bot[method] !== "function") continue;
            if (method === "constructor" || method === "on") continue;
            if (/^_/.test(method)) continue; // Do not expose internal methods
            this.log.debug(`Binding ${method}`);
            loadedPlugin[method] = this.bot[method].bind(this.bot);
        }

        this.log.debug(`Created ${pluginName}.`);
        loadedPlugin.start(this.config, this.auth);

        return loadedPlugin;
    }

    // Adds the plugin to the list of active plugins
    addPlugin(loadedPlugin) {
        this.plugins.push(loadedPlugin);
        this.log.verbose(`Added ${loadedPlugin.plugin.name}.`);
    }

    // Returns true if the plugin was added successfully, false otherwise.
    loadAndAdd(pluginName) {
        try {
            const plugin = this.loadPlugin(pluginName);
            this.log.debug(pluginName + " loaded correctly.");
            this.addPlugin(plugin);
            return true;
        } catch (e) {
            this.log.warn(e);
            this.log.warn(`Failed to initialize plugin ${pluginName}.`);
            return false;
        }
    }

    // Load and add every plugin in the list.
    loadPlugins(pluginNames) {
        this.log.verbose(`Loading and adding ${pluginNames.length} plugins...`);
        Error.stackTraceLimit = 5; // Avoid printing useless data in stack traces

        const log = pluginNames.map(name => this.loadAndAdd(name));
        if (log.some(result => result !== true)) {
            this.log.warn("Some plugins couldn't be loaded.");
        }

        Error.stackTraceLimit = 10; // Reset to default value
    }

    // Returns true if at least one plugin was removed
    removePlugin(pluginName) {
        this.log.verbose(`Removing plugin ${pluginName}`);
        const prevPluginNum = this.plugins.length;
        const isCurrentPlugin = nameMatches(pluginName);
        this.plugins.filter(isCurrentPlugin).forEach(pl => pl.stop());
        this.plugins = this.plugins.filter(pl => !isCurrentPlugin(pl));
        const curPluginNum = this.plugins.length;
        return (prevPluginNum - curPluginNum) > 0;
    }

    stopPlugins() {
        return Promise.all(this.plugins.map(pl => pl.stop()));
    }

    emit(event, message) {
        this.log.debug(`Triggered event ${event}`);

        // Command emitter
        if (message.text !== undefined && message.entities && message.entities[0].type === "bot_command") {
            const entity = message.entities[0];

            const rawCommand = message.text.slice(entity.offset + 1, entity.offset + entity.length);
            const [command] = rawCommand.replace(/\//, "").split("@");

            let args = [];
            if (entity.offset + entity.length < message.text.length) {
                args = message.text.slice(entity.offset + entity.length + 1).split(" ");
            }

            this.emitter.emit("_command", {message, command, args});
        } else if (message.query !== undefined) {
            const parts = message.query.split(" ");
            const command = parts[0].toLowerCase();
            const args = parts.length > 1 ? parts.slice(1) : [];
            this.emitter.emit("_inline_command", {message, command, args});
        }

        this.emitter.emit(event, {message});
    }
};
