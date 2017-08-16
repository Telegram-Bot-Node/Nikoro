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
            needs: {
                database: false,
                utils: false
            },

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
            JSON.stringify(this.db, null, 4),
            cb
        );
    }

    constructor(listener, config) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = Log.get(this.plugin.name, config);
        this.listener = listener;

        if (this.plugin.needs) {
            if (this.plugin.needs.database) {
                try {
                    const serialized = fs.readFileSync(`./db/plugin_${this.plugin.name}.json`, "utf8");
                    this.db = JSON.parse(serialized);
                } catch (e) {
                    this.db = {};
                }
            }
        }

        this.syncInterval = 5000;

        this.syncTimer = setInterval(() => this.synchronize(), this.syncInterval);

        this.handlerNames = {
            "text": "onText",
            "inline_query": "onInline",
            "_command": "onCommand",
            "_inline_command": "onInlineCommand",
            "audio": "onAudio",
            "document": "onDocument",
            "photo": "onPhoto",
            "sticker": "onSticker",
            "video": "onVideo",
            "voice": "onVoice",
            "contact": "onContact",
            "location": "onLocation",
            "new_chat_participant": "onNewChatParticipant",
            "left_chat_participant": "onLeftChatParticipant",
        }

        this.handlers = {};

        const eventNames = Object.keys(this.handlerNames);
        for (const eventName of eventNames) {
            const handlerName = this.handlerNames[eventName];
            if (typeof this[handlerName] !== 'function') continue;
            const handler = this[handlerName].bind(this);
            this.listener.on(eventName, handler);
            this.handlers[eventName] = handler; // Keeps a reference to the handler so that it can be removed later
        }
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
};
