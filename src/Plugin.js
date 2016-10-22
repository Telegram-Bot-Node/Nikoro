import Log from "./Log";
import fs from "fs";

export default class Plugin {

    static Type = {
        NORMAL: 0x01,
        INLINE: 0x02,
        PROXY: 0x04,
        SPECIAL: 0x08
    };

    static Visibility = {
        VISIBLE: 0,
        HIDDEN: 1
    };

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
            `./plugin_${this.plugin.name}.json`,
            JSON.stringify(this.db, null, 4),
            cb
        );
    }

    constructor(listener, bot) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = Log.get(this.plugin.name);
        this.listener = listener;
        this.bot = bot;

        if (this.plugin.needs) {
            if (this.plugin.needs.database) {
                let serialized;
                try {
                    serialized = fs.readFileSync(`./plugin_${this.plugin.name}.json`, "utf8");
                } catch (e) {
                    serialized = "{}";
                }
                this.db = JSON.parse(serialized);
            }
        }

        this.syncInterval = 5000;

        setInterval(() => this.synchronize(), this.syncInterval);

        // text
        if (typeof this.onText === 'function')
            this.listener.on("text", (...args) => this.onText(...args));
        // commands
        if (typeof this.onCommand === 'function')
            this.listener.on("_command", (...args) => this.onCommand(...args));

        // media
        if (typeof this.onAudio === 'function')
            this.listener.on("audio", (...args) => this.onAudio(...args));
        if (typeof this.onDocument === 'function')
            this.listener.on("document", (...args) => this.onDocument(...args));
        if (typeof this.onPhoto === 'function')
            this.listener.on("photo", (...args) => this.onPhoto(...args));
        if (typeof this.onSticker === 'function')
            this.listener.on("sticker", (...args) => this.onSticker(...args));
        if (typeof this.onVideo === 'function')
            this.listener.on("video", (...args) => this.onVideo(...args));
        if (typeof this.onVoice === 'function')
            this.listener.on("voice", (...args) => this.onVoice(...args));

        // other
        if (typeof this.onContact === 'function')
            this.listener.on("contact", (...args) => this.onContact(...args));
        if (typeof this.onLocation === 'function')
            this.listener.on("location", (...args) => this.onLocation(...args));
        if (typeof this.onNewChatParticipant === 'function')
            this.listener.on("new_chat_participant", (...args) => this.onNewChatParticipant(...args));
        if (typeof this.onLeftChatParticipant === 'function')
            this.listener.on("left_chat_participant", (...args) => this.onLeftChatParticipant(...args));
    }

    start() {
        return;
    }

    stop() {
        return;
    }
}
