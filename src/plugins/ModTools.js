const Plugin = require("./../Plugin");
const Util = require("../Util");

module.exports = class ModTools extends Plugin {
    static get plugin() {
        return {
            name: "ModTools",
            description: "Moderation tools",
            help: `- Warnings: use /warn to warn a user and delete the message (gets kicked after 3 warnings)
- Blacklist: words that will get you kicked and your message removed. /blacklist shows the blacklist, \`/blacklist add <word>\` adds a word, \`/blacklist delete <word>\` removes it.
- #mod, #admin: use #mod to notify all mods, #admin to notify all admins.`
        };
    }

    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
        if (!this.db.warnings)
            this.db.warnings = {};
        if (!this.db.blacklist)
            this.db.blacklist = {};
    }

    onCommand({message, command, args}) {
        const chatID = message.chat.id;
        switch (command) {
            case "warn": {
                if (!this.auth.isMod(message.from.id, chatID))
                    return "Insufficient privileges.";
                if (!message.reply_to_message)
                    return "Reply to a message with /warn to issue a warning and delete a message.";
                if (!message.from)
                    return "Internal error.";
                const target = message.reply_to_message.from.id;
                if (!this.db.warnings[chatID])
                    this.db.warnings[chatID] = {[target]: 0};
                if (!this.db.warnings[chatID][target])
                    this.db.warnings[chatID][target] = 0;
                this.db.warnings[chatID][target]++;
                if (this.db.warnings[chatID][target] < 3) {
                    this.db.warnings[chatID][target] = 0;
                    this.kick(message, target);
                    this.deleteMessage(message.chat.id, message.message_id);
                    return "User warned. Kicked after 3 warnings.";
                }
                return `User warned. Number of warnings: ${this.db.warnings[chatID][target]}/3.`;
            }
            case "blacklist": {
                if (args.length === 0) {
                    if (!this.db.blacklist[chatID])
                        return "The blacklist is empty.";
                    return this.db.blacklist[chatID].map(word => `- ${word}`).join("\n");
                }
                if (!this.auth.isMod(message.from.id, chatID))
                    return "Insufficient privileges.";
                const word = args.slice(1).join(" ");
                if (!this.db.blacklist[chatID])
                    this.db.blacklist[chatID] = [];
                switch (args[0]) {
                    case "add":
                        if (args.length === 1)
                            return "Syntax: `/blacklist add <word>";
                        this.db.blacklist[chatID].push(word);
                        return "Done!";
                    case "delete":
                        if (args.length === 1)
                            return "Syntax: `/blacklist delete <word>";
                        this.db.blacklist[chatID] = this.db.blacklist[chatID].filter(val => val !== word);
                        return "Done!";
                    default:
                        return "Syntax: `/blacklist <add/delete> <word>`";
                }
            }
        }
    }

    onText({message}) {
        const chatID = message.chat.id;
        if (message.text.includes("#admin")) {
            for (const admin of this.auth.getAdmins(chatID)) {
                this.sendMessage(admin, `Message from ${Util.buildPrettyChatName(message.chat)}:\n\n${message.text}`)
                    .catch(() => this.sendMessage(chatID, `Couldn't send message to admin ${admin} (${Util.nameResolver.getUsernamesFromUserID(admin).join(", ")}). Perhaps they need to initiate a conversation with the bot?`));
            }
        }
        if (message.text.includes("#mod")) {
            for (const mod of this.auth.getMods(chatID)) {
                this.sendMessage(mod, `Message from ${Util.buildPrettyChatName(message.chat)}:\n\n${message.text}`)
                    .catch(() => this.sendMessage(chatID, `Couldn't send message to mod ${mod} (${Util.nameResolver.getUsernamesFromUserID(mod).join(", ")}). Perhaps they need to initiate a conversation with the bot?`));
            }
        }

        if (this.auth.isMod(message.from.id, message.chat.id))
            return;
        for (const word of this.db.blacklist[chatID]) {
            if (!message.text.includes(word))
                continue;
            this.deleteMessage(message.chat.id, message.message_id);
            this.kick(message, message.from.id);
            break;
        }
    }

    kick(message, target) {
        this.kickChatMember(message.chat.id, target)
            .catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
    }
};
