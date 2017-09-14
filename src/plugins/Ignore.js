const Plugin = require("../Plugin");

module.exports = class Ignore extends Plugin {

    static get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <ID>",

            visibility: Plugin.Visibility.VISIBLE,
            type: Plugin.Type.NORMAL | Plugin.Type.PROXY
        };
    }

    start(config, auth) {
        this.auth = auth;
        if (!this.db.ignored)
            this.db.ignored = [];
    }

    proxy(eventName, message) {
        if (this.db.ignored.indexOf(message.from.id) !== -1)
            return Promise.reject();
        return Promise.resolve();
    }

    onCommand({message, command, args}) {
        switch (command) {
        case "ignorelist":
            return this.sendMessage(message.chat.id, JSON.stringify(this.db.ignored));
        case "ignore": {
            let target;
            if (args.length === 1) {
                target = args[0];
                if (/[@a-z_]/i.test(target))
                    return this.sendMessage(message.chat.id, "Syntax: `/ignore <ID>`");
            } else if (message.reply_to_message) {
                if (message.reply_to_message.new_chat_participant)
                    target = message.reply_to_message.new_chat_participant.id;
                else if (message.reply_to_message.left_chat_participant)
                    target = message.reply_to_message.left_chat_participant.id;
                else
                    target = message.reply_to_message.from.id;
            } else
                return this.sendMessage(message.chat.id, "No target found.");

            if (this.auth.isMod(target)) return this.sendMessage(message.chat.id, "Can't ignore mods.");

            this.db.ignored.push(target);

            this.sendMessage(message.chat.id, "Ignored.");
            return;
        }
        case "unignore": {
            let target;
            if (args.length === 1) {
                target = args[0];
                if (/[@a-z_]/i.test(target))
                    return this.sendMessage(message.chat.id, "Syntax: `/ignore <ID>`");
            } else if (message.reply_to_message) {
                if (message.reply_to_message.new_chat_participant)
                    target = message.reply_to_message.new_chat_participant.id;
                else if (message.reply_to_message.left_chat_participant)
                    target = message.reply_to_message.left_chat_participant.id;
                else
                    target = message.reply_to_message.from.id;
            } else
                return this.sendMessage(message.chat.id, "No target found.");

            this.db.ignored = this.db.ignored.filter(id => id !== target);
            this.sendMessage(message.chat.id, "Done.");
            return;
        }
        default:
            return;
        }
    }
};
