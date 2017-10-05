const Plugin = require("../Plugin");

module.exports = class Ignore extends Plugin {

    constructor(listener, bot, config, auth) {
        super(listener, bot, config, auth);

        this.auth = auth;
        if (!this.db.ignored) {
            this.db.ignored = [];
        }
    }

    static get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <ID>",

            visibility: Plugin.Visibility.VISIBLE,
            type: Plugin.Type.NORMAL | Plugin.Type.PROXY
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
                    target = args[0];
                    if (/[@a-z_]/i.test(target)) // May not ignore usernames
                        return "Syntax: `/ignore <ID>`";
                    target = Number(target);
                } else if (message.reply_to_message) {
                    if (message.reply_to_message.new_chat_participant)
                        target = message.reply_to_message.new_chat_participant.id;
                    else if (message.reply_to_message.left_chat_participant)
                        target = message.reply_to_message.left_chat_participant.id;
                    else
                        target = message.reply_to_message.from.id;
                } else return "No target found.";

                if (this.auth.isMod(target)) return "Can't ignore mods.";

                this.db.ignored.push(target);

                return "Ignored.";
            },
            unignore: ({args, message}) => {
                let target;
                if (args.length === 1) {
                    target = args[0];
                    if (/[@a-z_]/i.test(target))
                        return "Syntax: `/ignore <ID>`";
                    target = Number(target);
                } else if (message.reply_to_message) {
                    if (message.reply_to_message.new_chat_participant)
                        target = message.reply_to_message.new_chat_participant.id;
                    else if (message.reply_to_message.left_chat_participant)
                        target = message.reply_to_message.left_chat_participant.id;
                    else
                        target = message.reply_to_message.from.id;
                } else return "No target found.";

                this.db.ignored = this.db.ignored.filter(id => id !== target);
                return "Done.";
            }
        };
    }
};
