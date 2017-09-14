const Plugin = require("./../Plugin");

module.exports = class UserInfo extends Plugin {
    static get plugin() {
        return {
            name: "UserInfo",
            description: "Log information about users",
            help: "Syntax: `/id user`",

            type: Plugin.Type.PROXY
        };
    }

    proxy(eventName, message) {
        // Discard inline messages
        if (!message.chat) return;

        if (message.from.username) {
            this.db[message.from.username] = message.from.id;
        }

        // Register people who join or leave, too.
        if (message.new_chat_participant || message.left_chat_participant) {
            const source = message.new_chat_participant ?
                message.new_chat_participant :
                message.left_chat_participant;
            this.db[source.username] = source.id;
        }
        return Promise.resolve();
    }

    onCommand({message, command, args}) {
        if (command !== "id") return;

        let username;
        if (args.length === 1)
            username = args[0].replace("@", "");
        else if (message.reply_to_message) {
            if (message.reply_to_message.new_chat_participant)
                username = message.reply_to_message.new_chat_participant.username;
            else if (message.reply_to_message.left_chat_participant)
                username = message.reply_to_message.left_chat_participant.username;
            else
                username = message.reply_to_message.from.username;
        } else
            return this.sendMessage(message.chat.id, "Syntax: /id @username");

        if (!(username in this.db))
            return this.sendMessage(message.chat.id, "I've never seen that user before.");

        const userId = this.db[username];
        const aliases = Object.keys(this.db).filter(username => this.db[username] === userId);

        this.sendMessage(message.chat.id, `${username} - ${this.db[username]}

Known aliases: ${aliases.join(", ")}`);
    }
};