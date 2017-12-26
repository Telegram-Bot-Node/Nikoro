/* eslint no-sync: 0 */
const fs = require("fs");
const path = require("path");
const Logger = require("./Log");
const Plugin = require("./Plugin");

// A small utility functor to find a plugin with a given name
const nameMatches = targetName => pl => pl.plugin.name.toLowerCase() === targetName.toLowerCase();

const SYNC_INTERVAL = 5000;

function messageIsCommand(message) {
    if (!message.entities) return;
    const entity = message.entities[0];
    return entity.offset === 0 && entity.type === "bot_command";
}

// Note: we only parse commands at the start of the message,
// therefore we suppose entity.offset = 0
function parseCommand(message) {
    const entity = message.entities[0];

    const rawCommand = message.text.substring(1, entity.length);
    let command;
    if (rawCommand.search("@") === -1)
        command = rawCommand;
    else
        command = rawCommand.substring(0, rawCommand.search("@"));

    let args = [];
    if (message.text.length > entity.length) {
        args = message.text.slice(entity.length + 1).split(" ");
    }

    return {args, command};
}

module.exports = class PluginManager {
    constructor(bot, config, auth) {
        this.bot = bot;
        this.log = new Logger("PluginManager", config);
        this.auth = auth;
        this.plugins = [];

        this.config = config;

        const events = Object.keys(Plugin.handlerNames)
            // We handle the message event by ourselves.
            .filter(prop => prop !== "message")
            // Events beginning with an underscore (eg. _command) are internal.
            .filter(prop => prop[0] !== "_");

        // Registers a handler for every Telegram event.
        // It runs the message through the proxy and forwards it to the plugin manager.
        for (const eventName of events) {
            bot.on(
                eventName,
                async message => {
                    // const messageID = message.message_id + '@' + message.chat.id;
                    // console.time(messageID);
                    this.parseHardcoded(message);
                    try {
                        await Promise.all(this.plugins
                            .filter(plugin => plugin.plugin.isProxy)
                            .map(plugin => plugin.proxy(eventName, message))
                        );
                    } catch (err) {
                        if (err)
                            this.log.error("Message rejected with error", err);
                    }
                    try {
                        await this.emit("message", message);
                        await this.emit(eventName, message);
                        this.log.debug("Message chain completed.");
                    } catch (e) {
                        if (!e) {
                            this.log.error("Message chain failed with no error message.");
                            this.bot.sendMessage(message.chat.id, "An error occurred.");
                            return;
                        }
                        this.log.error(e);
                        this.bot.sendMessage(message.chat.id, e.stack.split("\n").slice(0, 2).join("\n"));
                    }
                    // console.timeEnd(messageID);
                }
            );
        }
    }

    parseHardcoded(message) {
        // Hardcoded commands
        if (!messageIsCommand(message)) return;
        const {command, args: [pluginName, targetChat]} = parseCommand(message);
        // Skip everything if we're not interested in this command
        if (command !== "help" && command !== "plugins" && command !== "enable" && command !== "disable") return;

        const response = this.processHardcoded(command, pluginName, targetChat, message);
        this.bot.sendMessage(message.chat.id, response, {
            parse_mode: "markdown",
            disable_web_page_preview: true
        });
    }

    processHardcoded(command, pluginName, targetChat, message) {
        if (command === "help") {
            const availablePlugins = this.plugins
                .map(pl => pl.plugin)
                .filter(pl => !pl.isHidden);

            if (!pluginName)
                return availablePlugins
                    .map(pl => `*${pl.name}*: ${pl.description}`)
                    .join("\n");

            const plugin = availablePlugins
                .find(pl => pl.name.toLowerCase() === pluginName.toLowerCase());

            if (!plugin)
                return "No such plugin.";
            return `*${plugin.name}* - ${plugin.description}\n\n${plugin.help}`;
        }

        if (command === "plugins") {
            const pluginPath = path.join(__dirname, "plugins");
            const files = fs.readdirSync(pluginPath).map(filename => filename.replace(/\.js$/, ""));
            const plugins = files.map(filename => {
                try {
                    return require(path.join(pluginPath, filename), false).plugin;
                } catch (e) {
                    let message = e.message;
                    message = message.replace(/^Cannot find module '([^']+)'$/, "Must install `$1` first");
                    return {
                        name: `${filename}`,
                        disabled: message
                    };
                }
            });
            // Does the list of plugins contain the given name?
            const isEnabled = pl => this.plugins.some(nameMatches(pl.name))
            const enabled = plugins
                .filter(pl => isEnabled(pl))
                .map(pl => `*${pl.name}*: ${pl.description}`)
                .join("\n");
            const available = plugins
                .filter(pl => !isEnabled(pl))
                .map(pl => `*${pl.name}*` + (pl.disabled ? ` (${pl.disabled})` : `: ${pl.description}`))
                .join("\n");
            return "*Enabled:*\n" + enabled + "\n\n*Available:*\n" + available;
        }

        if (!this.auth.isOwner(message.from.id, message.chat.id))
            return "Insufficient privileges (owner required).";
        // Syntax: /("enable"|"disable") pluginName [targetChat|"chat"]
        // The string "chat" will enable the plugin in the current chat.
        if (targetChat === "chat") targetChat = message.chat.id;
        targetChat = Number(targetChat);
        // Checks if it is already in this.plugins
        const isGloballyEnabled = this.plugins.some(nameMatches(pluginName));
        switch (command) {
            case "enable":
                if (isGloballyEnabled)
                    return "Plugin already enabled.";
                if (targetChat) {
                    try {
                        this.loadAndAdd(pluginName);
                        const plugin = this.plugins.find(nameMatches(pluginName));
                        plugin.blacklist.delete(targetChat);
                        return `Plugin enabled successfully for chat ${targetChat}.`;
                    } catch (e) {
                        this.log.warn(e);
                        if (e.message === "No such file.")
                            return "No such plugin.\n\nIf you can't find the plugin you want, try running /plugins.";
                        return "Couldn't load plugin: " + e.message;
                    }
                }

                this.log.info(`Enabling ${pluginName} from message interface`);
                try {
                    this.loadAndAdd(pluginName);
                    return "Plugin enabled successfully.";
                } catch (e) {
                    this.log.warn(e);
                    if (e.message === "No such file.")
                        return "No such plugin.\n\nIf you can't find the plugin you want, try running /plugins.";
                    if (!/^Cannot find module/.test(e.message))
                        return "Couldn't load plugin, check console for errors.";
                    return e.message.replace(/Cannot find module '([^']+)'/, "The plugin has a missing dependency: `$1`");
                }

            case "disable":
                if (targetChat) {
                    if (!isGloballyEnabled)
                        return "Plugin isn't enabled.";
                    const plugin = this.plugins.find(nameMatches(pluginName));
                    plugin.blacklist.add(targetChat);
                    return `Plugin disabled successfully for chat ${targetChat}.`;
                }
                if (isGloballyEnabled) {
                    const outcome = this.removePlugin(pluginName);
                    return outcome ? "Plugin disabled successfully." : "An error occurred.";
                }
                return "Plugin already disabled.";
        }
    }

    // Instantiates the plugin.
    // Case-insensitive.
    // Returns the plugin itself.
    loadPlugin(_pluginName) {
        // Find a matching filename, case-insensitively
        const files = fs.readdirSync(path.join(__dirname, "plugins")).map(filename => filename.replace(/\.js$/, ""));
        const pluginName = files.find(filename => filename.toLowerCase() === _pluginName.toLowerCase());
        if (!pluginName)
            throw new Error("No such file.");

        const pluginPath = path.join(__dirname, "plugins", pluginName);
        /* Invalidates the require() cache.
         * This allows for "hot fixes" to plugins: just /disable it, make the
         * required changes, and /enable it again.
         * If the cache wasn't invalidated, the plugin would be loaded from
         * cache rather than from disk, meaning that your changes wouldn't apply.
         * Method: https://stackoverflow.com/a/16060619
         */
        delete require.cache[require.resolve(pluginPath)];
        const ThisPlugin = require(pluginPath);

        this.log.debug(`Required ${pluginName}`);

        // Load the blacklist and database from disk
        const databasePath = PluginManager.getDatabasePath(pluginName);
        let db = {};
        let blacklist = [];

        if (fs.existsSync(databasePath)) {
            const data = JSON.parse(fs.readFileSync(databasePath, "utf8"));
            db = data.db;
            blacklist = data.blacklist;
        }

        const loadedPlugin = new ThisPlugin({
            db,
            blacklist,
            bot: this.bot,
            config: this.config,
            auth: this.auth
        });

        // Bind all the methods from the bot API
        for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(this.bot))) {
            if (typeof this.bot[method] !== "function") continue;
            if (method === "constructor" || method === "on" || method === "onText") continue;
            if (/^_/.test(method)) continue; // Do not expose internal methods
            this.log.debug(`Binding ${method}`);
            loadedPlugin[method] = this.bot[method].bind(this.bot);
        }

        this.log.debug(`Created ${pluginName}.`);

        return loadedPlugin;
    }

    // Adds the plugin to the list of active plugins
    addPlugin(loadedPlugin) {
        this.plugins.push(loadedPlugin);
        this.log.verbose(`Added ${loadedPlugin.plugin.name}.`);
    }

    // Returns true if the plugin was added successfully, false otherwise.
    loadAndAdd(pluginName, persist = true) {
        try {
            const plugin = this.loadPlugin(pluginName);
            this.log.debug(pluginName + " loaded correctly.");
            this.addPlugin(plugin);
            if (persist) {
                this.config.activePlugins.push(pluginName);
                fs.writeFileSync("config.json", JSON.stringify(this.config, null, 4));
            }
        } catch (e) {
            this.log.warn(`Failed to initialize plugin ${pluginName}.`);
            throw e;
        }
    }

    // Load and add every plugin in the list.
    loadPlugins(pluginNames, persist = true) {
        this.log.verbose(`Loading and adding ${pluginNames.length} plugins...`);
        Error.stackTraceLimit = 5; // Avoid printing useless data in stack traces

        const log = pluginNames.map(name => {
            try {
                this.loadAndAdd(name, persist);
                return true;
            } catch (e) {
                this.log.warn(e);
                return false;
            }
        });
        if (log.some(result => result !== true)) {
            this.log.warn("Some plugins couldn't be loaded.");
        }

        Error.stackTraceLimit = 10; // Reset to default value
    }

    // Returns true if at least one plugin was removed
    removePlugin(pluginName, persist = true) {
        this.log.verbose(`Removing plugin ${pluginName}`);
        if (persist) {
            this.config.activePlugins = this.config.activePlugins.filter(name => !nameMatches(name));
            fs.writeFileSync("config.json", JSON.stringify(this.config, null, 4));
        }
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

    static getDatabasePath(pluginName) {
        return path.join(__dirname, "..", "db", "plugin_" + pluginName + ".json");
    }

    startSynchronization() {
        this.synchronizationInterval = setInterval(() => {
            this.log.debug("Starting synchronization");
            this.auth.synchronize();
            this.plugins.forEach(plugin => {
                fs.writeFile(
                    PluginManager.getDatabasePath(plugin.plugin.name),
                    JSON.stringify({
                        db: plugin.db,
                        blacklist: Array.from(plugin.blacklist)
                    }),
                    err => {
                        if (err) {
                            this.log.error("Error synchronizing the database", err);
                        }
                    }
                );
            });
        }, SYNC_INTERVAL);
    }

    stopSynchronization() {
        if (this.synchronizationInterval) {
            clearInterval(this.synchronizationInterval);
        }
    }

    emit(event, message) {
        this.log.debug(`Triggered event ${event}`);

        let cmdPromise;
        if (event !== "message") {
            // Command emitter
            if (messageIsCommand(message)) {
                const {command, args} = parseCommand(message);
                cmdPromise = this._emit("_command", {message, command, args});
            } else if (message.query !== undefined) {
                const parts = message.query.split(" ");
                const command = parts[0].toLowerCase();
                const args = parts.length > 1 ? parts.slice(1) : [];
                cmdPromise = this._emit("_inline_command", {message, command, args});
            }
        }

        const msgPromise = this._emit(event, {message});
        return Promise.all([cmdPromise, msgPromise]);
    }

    _emit(event, data) {
        const handlerName = Plugin.handlerNames[event];
        return Promise.all(this.plugins
            // If the plugin exposes a listener
            .filter(pl => handlerName in pl)
            // If the plugin is disabled in this chat
            .filter(pl => ("chat" in data.message) && !pl.blacklist.has(data.message.chat.id))
            .map(pl => {
                try {
                    const ret = pl[handlerName](data)
                    const smartReply = pl.smartReply.bind(pl);
                    if (ret && ret.then)
                        return ret.then(x => smartReply(x, data.message));
                    return smartReply(ret, data.message);
                } catch (e) {
                    return Promise.reject(e);
                }
            })
        );
    }
};
