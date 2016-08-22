import Plugin from "./../Plugin";
import Auth from "../helpers/Auth";

export default class Kick extends Plugin {

    get plugin() {
        return {
            name: "Kick",
            description: "Kicks users",
            help: "Reply with /kick or ban, or send /[kick|ban] ID.",
            needs: {
                database: true
            }
        };
    }

    onText(message, reply) {
        if (message.text === "/list") return reply({
            type: "text",
            text: JSON.stringify(this.db["chat" + message.chat.id])
        });
        if (message.text === "/banlist") {
            if (!this.db[message.chat.id]) return reply({
                type: "text",
                text: "Empty."
            });
            reply({
                type: "text",
                text: JSON.stringify(this.db[message.chat.id])
            });
            return;
        }
        if (!Auth.isMod(message.from.id)) return;
        const parts = message.text.split(" ");
        if (parts[0] !== "/kick" && parts[0] !== "/ban" && parts[0] !== "/pardon") return;
        if (!message.reply_to_message && parts.length !== 2)
            return reply({
                type: "text",
                text: "Reply to a message sent by the kickee with /kick or /ban to remove him. Alternatively, use /kick or /ban followed by the user ID (eg. /kick 1234), which you can get from /list."
            });

        let target;
        if (parts.length === 2) target = Number(parts[1]);
        else if (message.reply_to_message.new_chat_participant)
            target = message.reply_to_message.new_chat_participant.id;
        else if (message.reply_to_message.left_chat_participant)
            target = message.reply_to_message.left_chat_participant.id;
        else
            target = message.reply_to_message.from.id;

        if (parts[0] === "/pardon") {
            if (!this.db[message.chat.id]) return;
            var banned = this.db[message.chat.id];
            this.db[message.chat.id] = banned.filter(id => id !== target);
            reply({
                type: "text",
                text: "Pardoned."
            });
            return;
        }

        if (Auth.isMod(target))
            return reply({
                type: "text",
                text: "Can't kick mods or admins."
            });

        if (parts[0] === "/ban") {
            if (!this.db[message.chat.id])
                this.db[message.chat.id] = [];
            this.db[message.chat.id].push(target);
            // The fallthrough is intended.
        }
        this.bot.kickChatMember(message.chat.id, target).catch((/* err */) => reply({
            type: "text",
            text: "An error occurred while kicking the user."
        }));
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
