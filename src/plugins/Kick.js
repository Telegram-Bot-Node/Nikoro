import Plugin from "./../Plugin";
import Auth from "../helpers/Auth";

export default class Kick extends Plugin {

    static get plugin() {
        return {
            name: "Kick",
            description: "Kicks users",
            help: "Reply with /kick or ban, or send /[kick|ban] ID.",
            needs: {
                database: true
            }
        };
    }

    onCommand({message, command, args}, reply) {
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
            return reply({
                type: "text",
                text: JSON.stringify(this.db["chat" + message.chat.id])
            });
        case "banlist":
            if (!this.db[message.chat.id]) return reply({
                type: "text",
                text: "Empty."
            });
            return reply({
                type: "text",
                text: JSON.stringify(this.db[message.chat.id])
            });
        case "kick":
            if (!Auth.isMod(message.from.id)) return;
            if (!target) return reply({
                type: "text",
                text: "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get from /list."
            });
            if (Auth.isMod(target)) return reply({
                type: "text",
                text: "Can't kick mods or admins."
            });
            this.bot.kickChatMember(message.chat.id, target).catch((/* err */) => reply({
                type: "text",
                text: "An error occurred while kicking the user."
            }));
            return;
        case "ban":
            if (!Auth.isMod(message.from.id)) return;
            if (!target) return reply({
                type: "text",
                text: "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get from /list."
            });
            if (Auth.isMod(target)) return reply({
                type: "text",
                text: "Can't ban mods or admins."
            });
            if (!banned)
                this.db[message.chat.id] = [];
            this.db[message.chat.id].push(target);
            this.bot.kickChatMember(message.chat.id, target).catch((/* err */) => reply({
                type: "text",
                text: "An error occurred while kicking the user."
            }));
            return;
        case "pardon":
            if (!Auth.isMod(message.from.id)) return;
            if (!target) return reply({
                type: "text",
                text: "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get from /list."
            });
            if (!banned) return;
            this.db[message.chat.id] = banned.filter(id => id !== target);
            reply({
                type: "text",
                text: "Pardoned."
            });
            return;
        default:
            return;
        }
    }

    onNewChatParticipant(message, reply) {
        // If there is no database, nobody was ever banned so far. Return early.
        if (!this.db[message.chat.id]) return;

        const target = message.new_chat_participant.id;

        if (this.db[message.chat.id].indexOf(target) === -1) return;
        if (Auth.isMod(target)) return;

        this.bot.kickChatMember(message.chat.id, target).catch((/* err */) => reply({
            type: "text",
            text: "An error occurred while kicking the user."
        }));
    }
}
