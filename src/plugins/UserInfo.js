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
            const userID = message.from.id;
            this.log.debug(`ID ${userID} mapped to username ${username}`);
            this.db[userID] = username;
        }

        // Register people who join or leave, too.
        if (message.new_chat_participant || message.left_chat_participant) {
            const source = message.new_chat_participant ?
                message.new_chat_participant :
                message.left_chat_participant;
            this.log.debug(`ID ${source.id} mapped to username ${source.username}`);
            this.db[source.id] = source.username;
        }

        // Util.nameResolver.setDb(this.db);
        return Promise.resolve();
    }

    onCommand({message, command, args}) {
        if (command !== "id") return;

        if (args.length === 1) {
            const input = args[0];
            if (/^@/.test(input)) {
                const username = input.replace("@", "");
                return this.printFromUsername(username, message.chat.id);
            } 
            const userID = input;
            return this.printFromID(userID, message.chat.id);
        }

        if (message.reply_to_message) {
            let userID;
            if (message.reply_to_message.new_chat_participant)
                userID = message.reply_to_message.new_chat_participant.id;
            else if (message.reply_to_message.left_chat_participant)
                userID = message.reply_to_message.left_chat_participant.id;
            else
                userID = message.reply_to_message.from.id;

            return this.printFromID(userID, message.chat.id);
        }
        
        return "Syntax: /id @username or /id userID";
    }

    printFromUsername(username, chatID) {
        const userID = Util.nameResolver.getUserIDFromUsername(username);
        if (!userID)
            return "No such user.";
        const isAdmin = this.auth.isAdmin(userID, chatID);
        const isMod = this.auth.isMod(userID, chatID);

        return UserInfo.print(username, userID, isMod, isAdmin);
    }

    printFromID(userID, chatID) {
        const username = Util.nameResolver.getUsernameFromUserID(userID);
        const isAdmin = this.auth.isAdmin(userID, chatID);
        const isMod = this.auth.isMod(userID, chatID);

        return UserInfo.print(username, userID, isMod, isAdmin);
    }

    static print(username, userID, isMod, isAdmin) {
        return {
            type: "text",
            text: `*Username*: ${username ? ("\`@" + username + "\`") : "none"}
*User ID*: \`${userID}\`
*Mod*? ${isMod ? "yes" : "no"}
*Admin*? ${isAdmin ? "yes" : "no"}`,
            options: {
                parse_mode: "Markdown"
            }
        };
    }
};