import Logger from "./Logger";
import Rebridge from "rebridge";

export default class Plugin {

    Type = {
        NORMAL: 1,
        INLINE: 2,
        SPECIAL: 991
    };

    Visibility = {
        VISIBLE: 0,
        HIDDEN: 1
    };

    get plugin() {
        return {
            name: "Plugin",
            description: "Base Plugin",
            help: "There is no need to ask for help",
            needs: {
                database: false,
                utils: false
            },

            visibility: this.Visibility.HIDDEN,
            type: this.Type.SPECIAL
        };
    }

    get config() {
        if (!this.db) throw new Error("Plugins without a database can't access config!");
        return this.db.config;
    }

    constructor(listener) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = Logger.get(this.plugin.name);
        this.listener = listener;

        if (this.plugin.needs) {
            if (this.plugin.needs.database) {
                let db = new Rebridge();
                if (!db["plugin_" + this.plugin.name]) {
                    db["plugin_" + this.plugin.name] = {};
                    this.db.config = {};
                }

                this.db = db["plugin_" + this.plugin.name];
            }
        }

        // text
        if (typeof this.onText === 'function')
            this.listener.on("text", (...args) => this.onText(...args));

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
    }

    check() {
        return true;
    }

    start() {
        return Promise.resolve();
    }

    stop() {
        return Promise.resolve();
    }

    get self() {
        /*
         * This is a hack.
         * When the Plugin constructor reads `this`, it gets a reference to the
         * Plugin class, not to the child (eg. PingPlugin), which means that eg.
         * `this.plugin.name` will contain "Plugin" and not the correct name
         * ("Ping").
         *
         * With this hack, to get the correct plugin name you'll need to read
         * `this.self.name`. Note that writing to `this.self` doesn't have any
         * effect.
         */
        return this;
    }
}