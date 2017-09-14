const Log = require("./Log");
const fs = require("fs");

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

    get plugin() {
        return this.constructor.plugin;
    }

    synchronize(cb = err => {
        if (err) throw err;
    }) {
        if (!this.db) return;
        fs.writeFile(
            `./db/plugin_${this.plugin.name}.json`,
            JSON.stringify({
                db: this.db,
                blacklist: Array.from(this.blacklist)
            }, null, 2),
            cb
        );
    }

    constructor(listener, config) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = Log.get(this.plugin.name, config);
        this.listener = listener;

        this.db = {};
        this.blacklist = new Set(); // Chats where the plugin is disabled
        try {
            const {db, blacklist} = JSON.parse(fs.readFileSync(`./db/plugin_${this.plugin.name}.json`, "utf8"));
            if (db) this.db = db;
            if (blacklist) this.blacklist = new Set(blacklist);
        } catch (e) {}

        this.syncInterval = 5000;

        this.syncTimer = setInterval(() => this.synchronize(), this.syncInterval);

        this.handlerNames = {
            text: "onText",
            inline_query: "onInline",
            _command: "onCommand",
            _inline_command: "onInlineCommand",
            audio: "onAudio",
            document: "onDocument",
            photo: "onPhoto",
            sticker: "onSticker",
            video: "onVideo",
            voice: "onVoice",
            contact: "onContact",
            location: "onLocation",
            new_chat_participant: "onNewChatParticipant",
            left_chat_participant: "onLeftChatParticipant"
        };

        this.handlers = {};

        const eventNames = Object.keys(this.handlerNames);
        for (const eventName of eventNames) {
            const handlerName = this.handlerNames[eventName];
            if (typeof this[handlerName] !== 'function') continue;
            const isEnabled = id => !this.blacklist.has(id); // A function that says whether the plugin is enabled or not in a given chat.
            const eventHandler = this[handlerName].bind(this); // A function that refers to the appropriate handler (this.onText, this.onCommand, etc.)
            const wrappedHandler = function({message}) {
                if (isEnabled(message.chat.id)) eventHandler.apply(null, arguments);
            }; // A function that receives the event, checks the message against the blacklist, and calls the appropriate handler
            this.listener.on(eventName, wrappedHandler);
            this.handlers[eventName] = wrappedHandler; // Keeps a reference to the handler so that it can be removed later
        }

        /* this.commands can contain an object, mapping command names (eg. "ping") to either:
         *
         *   - a string, in which case the string is sent as a message
         *   - an object, in which case it is passed to reply()
         */
        this.listener.on("_command", ({message, command, args}, reply) => {
            if (!this.commands) return;
            for (const trigger of Object.keys(this.commands)) {
                if (command !== trigger) continue;
                const ret = this.commands[trigger]({message, args});
                if (typeof ret === "string" || typeof ret === "number")
                    reply({
                        type: "text",
                        text: ret
                    });
                else if (typeof ret === "undefined") return;
                else
                    reply(ret);
            }
        });
    }

    start() {
        return;
    }

    stop() {
        clearInterval(this.syncTimer);
        const eventNames = Object.keys(this.handlers);
        for (const eventName of eventNames) {
            const handler = this.handlers[eventName];
            this.listener.removeListener(eventName, handler);
        }
    }

    compose(chatId, options) { // Internal method, used to simplify API access
        if (typeof chatId === "object") // Shortcut: you can pass message rather than message.chat.id
            chatId = chatId.chat.id;

        if (typeof options === "string") // Shortcut: you can pass a string rather than {type: text, text: arg}
            options = {type: "text", text: options}

        switch (options.type) {
            case "text":
                return this.sendMessage(chatId, options.text, options.options);

            case "inline":
                return this.answerInlineQuery(chatId, options.results, options.options);

            case "audio":
                return this.sendAudio(chatId, options.audio, options.options);
            case "document":
                return this.sendDocument(chatId, options.document, options.options);
            case "photo":
                return this.sendPhoto(chatId, options.photo, options.options);
            case "sticker":
                return this.sendSticker(chatId, options.sticker, options.options);
            case "video":
                return this.sendVideo(chatId, options.video, options.options);
            case "voice":
                return this.sendVoice(chatId, options.voice, options.options);

            case "status": case "chatAction":
                return this.sendChatAction(chatId, options.status, options.options);

            default: {
                const message = `Unrecognized reply type ${options.type}`;
                this.log.error(message);
                throw new Error(message);
            }
        }
    }
};
