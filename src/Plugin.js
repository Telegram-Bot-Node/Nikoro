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

    constructor(emitter) {
        if (new.target === Plugin) {
            throw new TypeError("Cannot construct Plugin instances directly!");
        }

        this.log = Logger.get(this.plugin.name);
        this.interface = emitter;

        this.init();

        /*if(this.plugin.needs.database)
            this.database = DatabaseWrapper(this.plugin.name);*/
    };

    init() {

    }

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