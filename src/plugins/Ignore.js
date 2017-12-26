const Plugin = require("../Plugin");
const Util = require("../Util.js");

module.exports = class Ignore extends Plugin {
    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
        if (!this.db.ignored) {
            this.db.ignored = [];
        }
    }

    static get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <ID/username>",

            isProxy: true
        };
    }

    proxy(eventName, message) {
        if (this.db.ignored.indexOf(message.from.id) !== -1)
            return Promise.reject();
        return Promise.resolve();
    }

    onCommands({message, command, args}) {
        switch (command) {
            case "ignorelist":
                return JSON.stringify(this.db.ignored);
            case "ignore": {
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "ignore");
                if (typeof target === "string") // Error messages
                    return target;
                if (this.auth.isChatAdmin(target, message.chat.id))
                    return "Can't ignore chat admins.";

                this.db.ignored.push(target);
                return "Ignored.";
            }
            case "unignore": {
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "unignore");
                if (typeof target === "string") // Error messages
                    return target;

                this.db.ignored = this.db.ignored.filter(id => id !== target);
                return "Unignored.";
            }
        }
    }
};
