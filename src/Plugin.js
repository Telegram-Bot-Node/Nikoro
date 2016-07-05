//import DatabaseWrapper from "./DatabaseWrapper";
import Logger from "./Logger";

export default class Plugin {

    Type = {
        NORMAL: 0,
        INLINE: 1,
        SPECIAL: 99
    };

    Visibility = {
        VISIBLE: 0,
        HIDDEN: 1,
    };

    plugin = {
        name: "Plugin",
        description: "Base Plugin",
        help: "There is no need to ask for help",

        type: this.Type.SPECIAL,
        visibility: this.Visibility.HIDDEN,

        needs : {
            database : false,
            utils: false
        }
    };

    constructor(listener) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }
        this.listener = listener;

        this.log = Logger.get(this.plugin.name);
        /*if(this.plugin.needs.database)
            this.database = DatabaseWrapper(this.plugin.name);*/

        if(typeof this.onText == 'function')
            this.listener.on("text", (...args) => this.onText(...args));
    };

    check() {
        return true;
    };

    start() {
        return new Promise (
            (resolve, reject) => {
                resolve();
            }
        );
    };

    stop() {
        return new Promise (
            (resolve, reject) => {
                resolve();
            }
        );
    };

}