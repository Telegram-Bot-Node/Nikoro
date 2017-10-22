const Plugin = require("./../Plugin");
const Util = require("./../Util");

module.exports = class UserInfo extends Plugin {
    static get plugin() {
        return {
            name: "UserInfo",
            description: "Log usernames and user IDs",
            help: "Syntax: `/id user`",

            isProxy: true
        };
    }

    constructor(obj) {
        super(obj);

        if (!this.db)
            this.db = {};
        Util.nameResolver.setDb(this.db);
        this.auth = obj.auth;
    }

    proxy(eventName, message) {
        // Discard inline messages
        if (!message.chat) return;

        if (message.from.username) {
            const username = message.from.username;
            const userId = message.from.id;
            this.log.debug(`Username ${username} mapped to ID ${userId}`);
            this.db[username] = userId;
        }

        // Register people who join or leave, too.
        if (message.new_chat_participant || message.left_chat_participant) {
            const source = message.new_chat_participant ?
                message.new_chat_participant :
                message.left_chat_participant;
            this.log.debug(`Username ${source.username} mapped to ID ${source.id}`);
            this.db[source.username] = source.id;
        }

        // Util.nameResolver.setDb(this.db);
        return Promise.resolve();
    }

    get commands() {
        return {
            id: ({message, args}) => {
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
                    return "Syntax: /id @username";

                if (!(username in Util.nameResolver.db))
                    return "I've never seen that user before.";

                const userId = Util.nameResolver.getUserIDFromUsername(username);
                const aliases = Util.nameResolver.getUsernamesFromUserID(userId);
                let tags = "";
                if (this.auth.isAdmin(message.from.id, message.chat.id))
                    tags += " [admin]";
                else if (this.auth.isMod(message.from.id, message.chat.id))
                    tags += " [mod]";

                return `${username} - ${userId}${tags}

Known aliases: ${aliases.join(", ")}`;
            }
        };
    }
};