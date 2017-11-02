const Plugin = require("./../Plugin");

module.exports = class ModTools extends Plugin {
    static get plugin() {
        return {
            name: "ModTools",
            description: "Moderation tools",
            help: `- Warnings: use /warn to warn a user and delete the message (gets kicked after 3 warnings)
- Blacklist: words that will get you kicked and your message removed. /blacklist shows the blacklist, \`/blacklist add <word>\` adds a word, \`/blacklist remove <word>\` removes it.
- #admin: use #admin to notify all admins.`
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

    get commands() {
        return {
            warn: ({message}) => {
                const chatID = message.chat.id;
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
                if (this.db.warnings[chatID][target] === 3) {
                    this.kick(message, target);
                    this.db.warnings[chatID][target] = 0;
                    return "User warned. Kicked after 3 warnings.";
                }
                return `User warned. Number of warnings: ${this.db.warnings[chatID][target]}/3.`;
            }
        };
    }

    kick(message, target) {
        this.kickChatMember(message.chat.id, target)
            .catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
    }
};
