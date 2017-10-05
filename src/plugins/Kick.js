const Plugin = require("./../Plugin");

module.exports = class Kick extends Plugin {

    static get plugin() {
        return {
            name: "Kick",
            description: "Kicks users",
            help: "Reply with /kick or ban, or send /[kick|ban] ID."
        };
    }

    constructor(listener, bot, config, auth) {
        super(listener, bot, config, auth);

        this.auth = auth;
    }

    onCommand({message, command, args}) {
        let target;
        if (args.length === 1) target = Number(args[0]);
        else if (message.reply_to_message) {
            if (message.reply_to_message.new_chat_participant)
                target = message.reply_to_message.new_chat_participant.id;
            else if (message.reply_to_message.left_chat_participant)
                target = message.reply_to_message.left_chat_participant.id;
            else
                target = message.reply_to_message.from.id;
        } else
            target = null;

        const banned = this.db[message.chat.id];

        switch (command) {
        case "list":
            return this.sendMessage(message.chat.id, JSON.stringify(this.db["chat" + message.chat.id]));
        case "banlist":
            if (!this.db[message.chat.id]) return this.sendMessage(message.chat.id, "Empty.");
            return this.sendMessage(message.chat.id, JSON.stringify(this.db[message.chat.id]));
        case "kick":
            if (!this.auth.isMod(message.from.id)) return;
            if (!target) return this.sendMessage(message.chat.id, "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get with `/id username` if the UserInfo plugin is enabled.");
            if (this.auth.isMod(target)) return this.sendMessage(message.chat.id, "Can't kick mods or admins.");
            this.kickChatMember(message.chat.id, target).catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
            return;
        case "ban":
            if (!this.auth.isMod(message.from.id)) return;
            if (!target) return this.sendMessage(message.chat.id, "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get with `/id username` if the UserInfo plugin is enabled.");
            if (this.auth.isMod(target)) return this.sendMessage(message.chat.id, "Can't ban mods or admins.");
            if (!banned)
                this.db[message.chat.id] = [];
            this.db[message.chat.id].push(target);
            this.kickChatMember(message.chat.id, target).catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
            return;
        case "pardon":
            if (!this.auth.isMod(message.from.id)) return;
            if (!target) return this.sendMessage(message.chat.id, "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get with `/id username` if the UserInfo plugin is enabled.");
            if (!banned) return;
            this.db[message.chat.id] = banned.filter(id => id !== target);
            this.sendMessage(message.chat.id, "Pardoned.");
            return;
        default:
            return;
        }
    }

    onNewChatParticipant({message}) {
        // If there is no database, nobody was ever banned so far. Return early.
        if (!this.db[message.chat.id]) return;

        const target = message.new_chat_participant.id;

        if (this.db[message.chat.id].indexOf(target) === -1) return;
        if (this.auth.isMod(target)) return;

        this.kickChatMember(message.chat.id, target).catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
    }
};
