const fs = require('fs');
const path = require('path');
const Logger = require("./Log");
const Plugin = require("./Plugin");
const Util = require("./Util");
const {EventEmitter} = require("events");

// A small utility functor to find a plugin with a given name
const nameMatches = targetName => pl => pl.plugin.name.toLowerCase() === targetName.toLowerCase();

const SYNC_INTERVAL = 5000;

module.exports = class PluginManager {

    constructor(bot, config, auth) {
        this.bot = bot;
        this.log = new Logger("PluginManager", config);
        this.auth = auth;
        this.plugins = [];
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(Infinity);

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
                message => {
                    this.parseHardcoded(message);
                    Promise.all(
                        this.plugins
                            .filter(plugin => plugin.plugin.isProxy)
                            .map(plugin => plugin.proxy(eventName, message))
                        )
                       .then(() => this.emit(
                            "message",
                            message
                        ))
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

    parseHardcoded(message) {
        // Hardcoded commands
        if (!message.text) return;
        const parts = Util.parseCommand(
            message.text,
            [
                "enable",
                "disable",
                "help"
            ],
            {
                overrideDeprecation: true
            }
        );
        if (!parts) return;
        let [command, pluginName, targetChat] = parts;

        if (command === "help") {
            const availablePlugins = this.plugins
                .map(pl => pl.plugin)
                .filter(pl => !pl.isHidden);
            if (pluginName) {
                pluginName = pluginName.toLowerCase();
                const plugin = availablePlugins
                    .filter(pl => pl.name.toLowerCase() === pluginName)[0];

                if (plugin)
                    this.bot.sendMessage(
                        message.chat.id,
                        `*${plugin.name}* - ${plugin.description}\n\n${plugin.help}`,
                        {
                            parse_mode: "markdown",
                            disable_web_page_preview: true
                        }
                    );
                else
                    this.bot.sendMessage(message.chat.id, "No such plugin.");
            } else {
                this.bot.sendMessage(
                    message.chat.id,
                    availablePlugins
                        .map(pl => `*${pl.name}*: ${pl.description}`)
                        .join("\n"),
                    {
                        parse_mode: "markdown",
                        disable_web_page_preview: true
                    }
                );
            }

            return;
        }

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
            } else if (isGloballyEnabled) {
                response = "Plugin already enabled.";
            } else {
                this.log.info(`Enabling ${pluginName} from message interface`);
                const status = this.loadAndAdd(pluginName);
                response = status ? "Plugin enabled successfully." : "An error occurred.";
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
            } else if (isGloballyEnabled) {
                const outcome = this.removePlugin(pluginName);
                response = outcome ? "Plugin disabled successfully." : "An error occurred.";
            } else {
                response = "Plugin already disabled.";
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
        const pluginPath = path.join(__dirname, 'plugins', pluginName);
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

        const loadedPlugin = new ThisPlugin(this.emitter, this.bot, this.config, this.auth);

        // Bind all the methods from the bot API
        for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(this.bot))) {
            if (typeof this.bot[method] !== "function") continue;
            if (method === "constructor" || method === "on") continue;
            if (/^_/.test(method)) continue; // Do not expose internal methods
            this.log.debug(`Binding ${method}`);
            loadedPlugin[method] = this.bot[method].bind(this.bot);
        }

        // Load the blacklist and database from disk
        const databasePath = PluginManager.getDatabasePath(loadedPlugin);

        if (fs.existsSync(databasePath)) {
            const {db, blacklist} = JSON.parse(fs.readFileSync(databasePath, "utf8"));

            loadedPlugin.blacklist = new Set(blacklist);
            loadedPlugin.db = db;
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
            return true;
        } catch (e) {
            this.log.warn(e);
            this.log.warn(`Failed to initialize plugin ${pluginName}.`);
            return false;
        }
    }

    // Load and add every plugin in the list.
    loadPlugins(pluginNames, persist = true) {
        this.log.verbose(`Loading and adding ${pluginNames.length} plugins...`);
        Error.stackTraceLimit = 5; // Avoid printing useless data in stack traces

        const log = pluginNames.map(name => this.loadAndAdd(name, persist));
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

    static getDatabasePath(plugin) {
        return path.join(__dirname, '..', 'db', 'plugin_' + plugin.plugin.name + '.json');
    }

    startSynchronization() {
        this.synchronizationInterval = setInterval(() => {
            this.plugins.forEach(plugin => {
                fs.writeFile(
                    PluginManager.getDatabasePath(plugin),
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

        if (event !== "message") {
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
        }

        this.emitter.emit(event, {message});
    }
};
