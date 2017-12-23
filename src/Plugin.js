const Logger = require("./Log");

module.exports = class Plugin {
    static get plugin() {
        return {
            name: "Plugin",
            description: "Base Plugin",
            help: "There is no need to ask for help",

            isHidden: true
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
            left_chat_member: "onLeftChatMember",
            location: "onLocation",
            new_chat_members: "onNewChatMembers",
            photo: "onPhoto",
            sticker: "onSticker",
            text: "onText",
            video: "onVideo",
            video_note: "onVideoNote",
            voice: "onVoice"
        };
    }

    get plugin() {
        return this.constructor.plugin;
    }

    constructor({db, blacklist, emitter, config /* , bot, auth */}) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = new Logger(this.plugin.name, config);
        this.listener = emitter;

        this.db = db;
        this.blacklist = new Set(blacklist); // Chats where the plugin is disabled
        this.handlers = {};

        const eventNames = Object.keys(Plugin.handlerNames);
        for (const eventName of eventNames) {
            const handlerName = Plugin.handlerNames[eventName];
            if (typeof this[handlerName] !== "function") continue;
            const isEnabled = id => !this.blacklist.has(id); // A function that says whether the plugin is enabled or not in a given chat.
            const eventHandler = this[handlerName].bind(this); // A function that refers to the appropriate handler (this.onText, this.onCommand, etc.)
            const smartReply = this.smartReply.bind(this);
            const wrappedHandler = function(arg) {
                if (("chat" in arg.message) && !isEnabled(arg.message.chat.id)) // If the plugin is disabled in this chat
                    return;
                const val = eventHandler(arg);
                if (val && val.then)
                    val.then(ret => smartReply(ret, arg.message));
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
                if (!ret)
                    return;
                if (ret.then) // if async fn
                    ret.then(val => this.smartReply(val, message));
                else
                    this.smartReply(ret, message);
            }
        };
        if (this.listener) {
            this.listener.on("_command", shortcutHandler);
        }
        this.shortcutHandler = shortcutHandler;
    }

    smartReply(ret, message) {
        if (typeof ret === "string" || typeof ret === "number") {
            this.sendMessage(message.chat.id, ret);
            return;
        }
        if (typeof ret === "undefined")
            return;
        switch (ret.type) {
            case "text":
                return this.sendMessage(message.chat.id, ret.text, ret.options);

            case "audio":
                return this.sendAudio(message.chat.id, ret.audio, ret.options);

            case "document":
                return this.sendDocument(message.chat.id, ret.document, ret.options);

            case "photo":
                return this.sendPhoto(message.chat.id, ret.photo, ret.options);

            case "sticker":
                return this.sendSticker(message.chat.id, ret.sticker, ret.options);

            case "video":
                return this.sendVideo(message.chat.id, ret.video, ret.options);

            case "voice":
                return this.sendVoice(message.chat.id, ret.voice, ret.options);

            case "status": case "chatAction":
                return this.sendChatAction(message.chat.id, ret.status, ret.options);

            default:
                this.log.error(`Unrecognized reply type ${ret.type}`);
                return Promise.reject(new Error(`Unrecognized reply type ${ret.type}`));
        }
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
