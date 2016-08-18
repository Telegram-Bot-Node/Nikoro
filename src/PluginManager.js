import Log from "./Log";
import MasterPlugin from "./MasterPlugin";
import Plugin from "./Plugin";
import {EventEmitter} from "events";

export default class PluginManager {

    constructor(bot) {
        this.bot = bot;
        this.log = Log.get("PluginManager");
        this.plugins = [];
        this.emitter = new EventEmitter();

        this.masterPlugin = new MasterPlugin(this.emitter, this);
        this.addPlugin(this.masterPlugin);

        var handleReply = function(chatId, reply) {
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
        for (let eventName of events) {
            bot.on(
                eventName,
                message => Promise.resolve(message)
                    .then(
                        message => Promise.all(
                            this.plugins
                                .filter(plugin => (plugin.plugin.type & Plugin.Type.PROXY) === Plugin.Type.PROXY)
                                .map(plugin => plugin.proxy(eventName, message))
                        )
                    )
                    .then(array => array.length > 0 ? array[0] : message)
                    .then(message => {
                        const chatID = message.chat.id;
                        this.emit(eventName, message, reply => handleReply(chatID, reply));
                    })
                    .catch(err => {
                        if (err) this.log.error("Message rejected with error", err);
                    })
            );
        }
    }

    // Instantiates the plugin and runs its health check
    // Returns a promise resolving to the plugin itself.
    loadPlugin(pluginName) {
        // default because of es6 classes
        let ThisPlugin = require('./plugins/' + pluginName).default;

        this.log.debug(`Required ${pluginName}`);

        let loadedPlugin = new ThisPlugin(this.emitter, this.bot);
        this.log.debug(`Created ${pluginName}.`);

        loadedPlugin.check();
        this.log.debug(`Health check for plugin ${pluginName} passed.`);

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
            let plugin = this.loadPlugin(pluginName);
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

        let log = pluginNames.map(name => this.loadAndAdd(name));
        if (log.some(result => result !== true)) {
            this.log.warn("Some plugins couldn't be loaded.");
        }
    }

    startPlugins() {
        return Promise.all(this.plugins.map(pl => {
            try {
                pl.start();
                return Promise.resolve();
            } catch (e) {
                return Promise.reject(e);
            }
        }));
    }

    stopPlugins() {
        return Promise.all(this.plugins.map(pl => pl.stop()));
    }

    emit(event, message, callback) {
        this.log.debug(`Triggered event ${event}`);
        this.emitter.emit(event, message, callback);
    }
}