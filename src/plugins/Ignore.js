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

    get commands() {
        return {
            ignorelist: () => JSON.stringify(this.db.ignored),
            ignore: ({args, message}) => {
                let target;
                if (args.length === 1) {
                    if (/^\d+$/.test(args[0])) {
                        target = args[0];
                    } else if (/^@[a-z0-9_]+$/i.test(args[0])) { // Attempt to resolve username
                        try {
                            target = Util.nameResolver.getUserIDFromUsername(args[0]);
                        } catch (e) {
                            return "Couldn't resolve username. Did you /enable UserInfo?";
                        }
                        if (!target)
                            return "I've never seen that username.";
                    } else {
                        return "Syntax: `/ignore <ID/username>`";
                    }
                    target = Number(target);
                } else if (message.reply_to_message) {
                    if (message.reply_to_message.new_chat_participant)
                        target = message.reply_to_message.new_chat_participant.id;
                    else if (message.reply_to_message.left_chat_participant)
                        target = message.reply_to_message.left_chat_participant.id;
                    else
                        target = message.reply_to_message.from.id;
                } else return "Syntax: `/ignore <ID/username>`";

                if (this.auth.isMod(target)) return "Can't ignore mods.";

                this.db.ignored.push(target);

                return "Ignored.";
            },
            unignore: ({args, message}) => {
                let target;
                if (args.length === 1) {
                    if (/^\d+$/.test(args[0])) {
                        target = args[0];
                    } else if (/^@[a-z0-9_]+$/i.test(target)) { // Attempt to resolve username
                        try {
                            target = Util.nameResolver.getUserIDFromUsername(target);
                        } catch (e) {
                            return "Couldn't resolve username. Did you /enable UserInfo?";
                        }
                        if (!target)
                            return "I've never seen that username.";
                    } else {
                        return "Syntax: `/unignore <ID/username>`";
                    }
                    target = Number(target);
                } else if (message.reply_to_message) {
                    if (message.reply_to_message.new_chat_participant)
                        target = message.reply_to_message.new_chat_participant.id;
                    else if (message.reply_to_message.left_chat_participant)
                        target = message.reply_to_message.left_chat_participant.id;
                    else
                        target = message.reply_to_message.from.id;
                } else return "Syntax: `/unignore <ID/username>`";

                this.db.ignored = this.db.ignored.filter(id => id !== target);
                return "Unignored.";
            }
        };
    }
};
