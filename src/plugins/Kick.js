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

    async onCommand({message, command, args}) {
        const chatID = message.chat.id;
        switch (command) {
            case "banlist": {
                if (!this.db[chatID])
                    return "Empty.";
                return this.db[chatID].map(id => Util.nameResolver.getUsernameFromUserID(id) || id).map(str => "- " + str).join("\n") || "None.";
            }
            case "kick": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "kick");
                if (typeof target === "string") return target;
                if (this.auth.isChatAdmin(target, chatID))
                    return "Can't kick chat admins!";
                return this.kick(chatID, target).catch(e => {
                    if (/USER_NOT_PARTICIPANT/.test(e.message))
                        return "The user is no longer in the chat!";
                    throw e;
                });
            }
            case "ban": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "ban");
                if (typeof target === "string") return target;
                if (this.auth.isChatAdmin(target, chatID))
                    return "Can't ban chat admins!";
                this.ban(chatID, target);
                return this.kick(chatID, target).catch(e => {
                    /* We don't care if the user is no longer in the chat, so
                     * we should swallow the error. However, in that case, the
                     * admin wouldn't receive any feedback! So, return a
                     * confirmation message.
                     */
                    if (/USER_NOT_PARTICIPANT/.test(e.message))
                        return "Banned.";
                    throw e;
                });
            }
            case "unban": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                const target = Util.getTargetID(message, args, "unban");
                if (typeof target === "string") return target;
                if (!this.db[chatID])
                    return "It seems that there are no banned users.";
                this.db[chatID] = this.db[chatID].filter(id => id !== target);
                return "Unbanned.";
            }
        }
    }

    kick(chatID, target) {
        return this.kickChatMember(chatID, target).then(() => {}).catch(e => {
            if (/CHAT_ADMIN_REQUIRED/.test(e.message))
                return "I'm not a chat administrator, I can't kick users!";
            throw e;
        });
    }

    // Note that banning does not imply kicking.
    ban(chatID, target) {
        if (!this.db[chatID])
            this.db[chatID] = [];
        this.db[chatID].push(target);
    }

    onNewChatMembers({message}) {
        const chatID = message.chat.id;
        // If there is no database, nobody was ever banned so far. Return early.
        if (!this.db[chatID]) return;

        // Return a promise, so that we can print exceptions.
        return Promise.all(message.new_chat_members
            .map(member => member.id)
            .filter(target => this.db[chatID].includes(target))
            .filter(target => !this.auth.isChatAdmin(target, chatID))
            .map(target => this.kick(chatID, target).then(msg => {
                // Yeah, not super clean.
                if (msg)
                    return this.sendMessage(chatID, msg);
            }))
        ).then(() => {});
    }
};
