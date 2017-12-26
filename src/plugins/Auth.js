const Plugin = require("./../Plugin");
const Util = require("./../Util");

module.exports = class AuthPlugin extends Plugin {
    static get plugin() {
        return {
            name: "Auth",
            description: "Plugin to handle authentication",
            help: `Commands:

/adminlist to list admins, /ownerlist to list the owner(s)
/addadmin, /deladmin to add or remove admins
/importadmins to import the chat's admins as this bot's "chat admins"

The owner(s) can add other owners by manually editing the bot's configuration and restarting the bot.`
        };
    }

    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
    }

    onCommand({message, command, args}) {
        const chatID = message.chat.id;
        switch (command) {
            case "adminlist":
                return this.auth.getChatAdmins(chatID).map(id => Util.nameResolver.getUsernameFromUserID(id) || id).map(str => "- " + str).join("\n") || "None.";
            case "addadmin": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "addadmin");
                if (typeof target === "string") return target;
                this.auth.addChatAdmin(target, chatID);
                return "Added.";
            }
            case "deladmin": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "deladmin");
                if (typeof target === "string") return target;
                this.auth.removeChatAdmin(target, chatID);
                return "Removed.";
            }
            case "importadmins": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                const users = this.auth.getChatAdmins(chatID);
                for (const user of users)
                    this.auth.addChatAdmin(user, message.chat.id);
                return `Imported ${users.length} users successfully!`
            }
        }
    }
};