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

    constructor({db, blacklist, config /* , bot, auth */}) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = new Logger(this.plugin.name, config);

        this.db = db;
        this.blacklist = new Set(blacklist); // Chats where the plugin is disabled
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
    }
};
