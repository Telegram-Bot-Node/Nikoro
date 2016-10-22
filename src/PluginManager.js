import Log from "./Log";
import MasterPlugin from "./MasterPlugin";
import Plugin from "./Plugin";
import Util from "./Util";
import Auth from "./helpers/Auth";
import {EventEmitter} from "events";

export default class PluginManager {

    constructor(bot) {
        this.bot = bot;
        this.log = Log.get("PluginManager");
        this.plugins = [];
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(Infinity);

        this.masterPlugin = new MasterPlugin(this.emitter, this);
        this.addPlugin(this.masterPlugin);

        const handleReply = (chatId, reply) => {
            switch (reply.type) {
            case "text":
                return bot.sendMessage(chatId, reply.text, reply.options);

            case "audio":
                return bot.sendAudio(chatId, reply.audio, reply.options);
            case "document":
                return bot.sendDocument(chatId, reply.document, reply.options);
            case "photo":
                return bot.sendPhoto(chatId, reply.photo, reply.options);
            case "sticker":
                return bot.sendSticker(chatId, reply.sticker, reply.options);
            case "video":
                return bot.sendVideo(chatId, reply.video, reply.options);
            case "voice":
                return bot.sendVoice(chatId, reply.voice, reply.options);

            case "status": case "chatAction":
                return bot.sendChatAction(chatId, reply.status, reply.options);

            default:
                this.log.error(`Unrecognized reply type ${reply.type}`);
            }
        };

        const events = ["text", "audio", "document", "photo", "sticker", "video", "voice", "contact", "location", "new_chat_participant", "left_chat_participant", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created"];
        // Registers a handler for every Telegram event.
        // It runs the message through the proxy and forwards it to the plugin manager.
        for (const eventName of events) {
            bot.on(
                eventName,
                message => Promise.resolve(message)
                    .then(message => {
                        // Hardcoded hot-swap plugin
                        if (!message.text) return message;
                        const parts = Util.parseCommand(
                            message.text,
                            [
                                "enableplugin",
                                "disableplugin"
                            ],
                            {
                                overrideDeprecation: true
                            }
                        );
                        if (!parts) return message;
                        if (!Auth.isAdmin(message.from.id)) return message;
                        const command = parts[0];
                        const pluginName = parts[1];
                        switch (command) {
                        case "enableplugin": {
                            this.log.info(`Enabling ${pluginName} from message interface`);
                            const status = this.loadAndAdd(pluginName);
                            handleReply(message.chat.id, {
                                type: "text",
                                text: `Status: ${status}`
                            });
                            break;
                        }
                        case "disableplugin":
                            this.removePlugin(pluginName);
                            handleReply(message.chat.id, {
                                type: "text",
                                text: "Done."
                            });
                            break;
                        default:
                            throw new Error("Unexpected case");
                        }
                        return message;
                    })
                    .then(
                        message => Promise.all(
                            this.plugins
                                .filter(plugin => (plugin.plugin.type & Plugin.Type.PROXY) === Plugin.Type.PROXY)
                                .map(plugin => plugin.proxy(eventName, message))
                        )
                        .then(() => message)
                    )
                    .then(message => this.emit(
                        eventName,
                        message,
                        reply => handleReply(message.chat.id, reply)
                    ))
                    .catch(err => {
                        if (err) this.log.error("Message rejected with error", err);
                    })
            );
        }
    }

    // Instantiates the plugin.
    // Returns the plugin itself.
    loadPlugin(pluginName) {
        // default because of es6 classes
        const ThisPlugin = require('./plugins/' + pluginName).default;

        this.log.debug(`Required ${pluginName}`);

        const loadedPlugin = new ThisPlugin(this.emitter, this.bot);
        this.log.debug(`Created ${pluginName}.`);

        loadedPlugin.start();

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

    removePlugin(pluginName) {
        this.log.verbose(`Removing plugin ${pluginName}`);
        this.plugins = this.plugins.filter(pl => pl.plugin.name.toLowerCase() !== pluginName.toLowerCase());
    }

    stopPlugins() {
        return Promise.all(this.plugins.map(pl => pl.stop()));
    }

    emit(event, message, callback) {
        this.log.debug(`Triggered event ${event}`);

        // Command emitter
        const regex = /^[\/!]([a-z0-9_]+)(?:@[a-z0-9_]+)?(?: (.*))?/i;
        if (regex.test(message.text)) {
            const parts = message.text.match(regex);
            const command = parts[1].toLowerCase();
            const args = parts[2] ? parts[2].split(" ") : [];
            this.emitter.emit("_command", {message, command, args}, callback);
        }

        this.emitter.emit(event, message, callback);
    }
}
