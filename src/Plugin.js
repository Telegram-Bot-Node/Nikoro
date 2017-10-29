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

    constructor({db, blacklist, bot, config, auth}) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = new Logger(this.plugin.name, config);

        this.db = db;
        this.blacklist = new Set(blacklist); // Chats where the plugin is disabled
    }

    stop() { }
};
