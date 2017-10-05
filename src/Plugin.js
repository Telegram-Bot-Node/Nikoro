const Log = require("./Log");

module.exports = class Plugin {

    static get Type() {
        return {
            NORMAL: 0x01,
            INLINE: 0x02,
            PROXY: 0x04,
            SPECIAL: 0x08
        };
    }

    static get Visibility() {
        return {
            VISIBLE: 0,
            HIDDEN: 1
        };
    }

    static get plugin() {
        return {
            name: "Plugin",
            description: "Base Plugin",
            help: "There is no need to ask for help",

            visibility: Plugin.Visibility.HIDDEN,
            type: Plugin.Type.SPECIAL
        };
    }

    static get handlerNames() {
        // This is the list of supported events, mapped to their handlers.
        return {
            message: "onMessage",

            _command: "onCommand",
            _inline_command: "onInlineCommand",

            audio: "onAudio",
            callback_query: "onCallbackQuery",
            contact: "onContact",
            document: "onDocument",
            inline_query: "onInline",
            left_chat_participant: "onLeftChatParticipant",
            location: "onLocation",
            new_chat_participant: "onNewChatParticipant",
            photo: "onPhoto",
            sticker: "onSticker",
            text: "onText",
            video: "onVideo",
            voice: "onVoice"
        };
    }

    get plugin() {
        return this.constructor.plugin;
    }

    constructor(listener, config) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = Log.get(this.plugin.name, config);
        this.listener = listener;

        this.db = {};
        this.blacklist = new Set(); // Chats where the plugin is disabled
        this.handlers = {};

        const eventNames = Object.keys(Plugin.handlerNames);
        for (const eventName of eventNames) {
            const handlerName = Plugin.handlerNames[eventName];
            if (typeof this[handlerName] !== 'function') continue;
            const isEnabled = id => !this.blacklist.has(id); // A function that says whether the plugin is enabled or not in a given chat.
            const eventHandler = this[handlerName].bind(this); // A function that refers to the appropriate handler (this.onText, this.onCommand, etc.)
            const wrappedHandler = function({message}) {
                if (("chat" in message) && !isEnabled(message.chat.id)) // If the plugin is disabled in this chat
                    return;
                eventHandler.apply(null, arguments);
            }; // A function that receives the event, checks the message against the blacklist, and calls the appropriate handler
            this.listener.on(eventName, wrappedHandler);
            this.handlers[eventName] = wrappedHandler; // Keeps a reference to the handler so that it can be removed later
        }

        /* this.commands can contain an object, mapping command names (eg. "ping") to either:
         *
         *   - a string, in which case the string is sent as a message
         *   - an object, in which case it is sent with the appropriate message type
         */
        const shortcutHandler = ({message, command, args}) => {
            if (!this.commands) return;
            for (const trigger of Object.keys(this.commands)) {
                if (command !== trigger) continue;
                const ret = this.commands[trigger]({message, args});
                if (typeof ret === "string" || typeof ret === "number") {
                    this.sendMessage(message.chat.id, ret);
                    return;
                }
                if (typeof ret === "undefined")
                    return;
                switch (ret.type) {
                case "text": {
                    return this.sendMessage(message.chat.id, ret.text, ret.options);
                }

                case "audio": {
                    return this.sendAudio(message.chat.id, ret.audio, ret.options);
                }

                case "document": {
                    return this.sendDocument(message.chat.id, ret.document, ret.options);
                }

                case "photo": {
                    return this.sendPhoto(message.chat.id, ret.photo, ret.options);
                }

                case "sticker": {
                    return this.sendSticker(message.chat.id, ret.sticker, ret.options);
                }

                case "video": {
                    return this.sendVideo(message.chat.id, ret.video, ret.options);
                }

                case "voice": {
                    return this.sendVoice(message.chat.id, ret.voice, ret.options);
                }

                case "status": case "chatAction": {
                    return this.sendChatAction(message.chat.id, ret.status, ret.options);
                }

                default: {
                    const errorMessage = `Unrecognized reply type ${ret.type}`;
                    this.log.error(errorMessage);
                    return Promise.reject(errorMessage);
                }
                }
            }
        };
        if (this.listener) {
            this.listener.on("_command", shortcutHandler);
        }
        this.shortcutHandler = shortcutHandler;
    }

    start() {
        return;
    }

    stop() {
        const eventNames = Object.keys(this.handlers);
        if (this.listener) {
            for (const eventName of eventNames) {
                const handler = this.handlers[eventName];
                this.listener.removeListener(eventName, handler);
            }
            this.listener.removeListener("_command", this.shortcutHandler);
        }
    }
};
