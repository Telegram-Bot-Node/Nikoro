const Plugin = require("./../Plugin");
const Util = require("../Util");

module.exports = class Kick extends Plugin {
    static get plugin() {
        return {
            name: "Kick",
            description: "Kicks users",
            help: "Reply with /kick or /ban, or send /[kick|ban] ID."
        };
    }

    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
    }

    get commands() {
        return {
            banlist: ({message}) => {
                const chatID = message.chat.id;
                if (!this.db[chatID])
                    return "Empty.";
                return JSON.stringify(this.db[chatID]);
            },
            kick: ({message, args}) => {
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Insufficient privileges.";
                const target = Util.getTargetID(message, args, "kick");
                if (typeof target === "string") return target;
                if (this.auth.isMod(target, message.chat.id))
                    return "Can't kick mods or admins (demote the target first).";
                this.kick(message, target);
                return "Kicked.";
            },
            ban: ({message, args}) => {
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Insufficient privileges.";
                const target = Util.getTargetID(message, args, "ban");
                if (typeof target === "string") return target;
                if (this.auth.isMod(target, message.chat.id))
                    return "Can't ban mods or admins (demote the target first).";
                this.ban(message, target);
                this.kick(message, target);
                return "Banned.";
            },
            pardon: ({message, args}) => {
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Insufficient privileges.";
                const target = Util.getTargetID(message, args, "pardon");
                if (typeof target === "string") return target;
                if (!this.db[message.chat.id])
                    return "It seems that there are no banned users.";
                this.db[message.chat.id] = this.db[message.chat.id].filter(id => id !== target);
                return "Pardoned.";
            }
        };
    }

    kick(message, target) {
        this.kickChatMember(message.chat.id, target)
            .catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
    }

    // Note that banning does not imply kicking.
    ban(message, target) {
        if (!this.db[message.chat.id])
            this.db[message.chat.id] = [];
        this.db[message.chat.id].push(target);
    }

    onNewChatMembers({message}) {
        const chatID = message.chat.id;
        // If there is no database, nobody was ever banned so far. Return early.
        if (!this.db[chatID]) return;

        for (const member of message.new_chat_members) {
            const target = member.id;
            if (!this.db[chatID].includes(target))
                continue;
            if (this.auth.isMod(target, message.chat.id))
                continue;
            this.kickChatMember(chatID, target)
                .catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
        }
    }
};
