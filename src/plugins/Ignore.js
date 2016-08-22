import Plugin from "../Plugin";
import Util from "../Util";
import Rebridge from "rebridge";
import Auth from "../helpers/Auth";

var db = new Rebridge();
if (!db.ignored)
    db.ignored = [];

export default class Ignore extends Plugin {

    get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <username>",
            isProxy: true
        };
    }

    proxy(eventName, message) {
        if (db.ignored && db.ignored.indexOf(message.from.id) !== -1)
            return Promise.reject();
        return Promise.resolve(message);
    }

    onText(message, reply) {
        if (message.text === "/ignorelist") return reply({
            type: "text",
            text: JSON.stringify(db.ignored)
        });
        this.ignore(message, reply);
        this.unignore(message, reply);
    }

    ignore(message, reply) {
        const parts = Util.parseCommand(message.text, "ignore");
        if (!parts) return;
        if (!Auth.isMod(message.from.id)) return;

        let target;
        if (parts.length === 2) target = Number(parts[1]);
        else if (message.reply_to_message.new_chat_participant)
            target = message.reply_to_message.new_chat_participant.id;
        else if (message.reply_to_message.left_chat_participant)
            target = message.reply_to_message.left_chat_participant.id;
        else
            target = message.reply_to_message.from.id;

        if (Auth.isMod(target)) return reply({
            type: "text",
            text: "Can't ignore mods."
        });
        db.ignored.push(target);
        reply({
            type: "text",
            text: "Ignored."
        });
    }

    unignore(message, reply) {
        const parts = Util.parseCommand(message.text, "unignore");
        if (!parts) return;
        if (!Auth.isMod(message.from.id)) return;

        let target;
        if (parts.length === 2) target = Number(parts[1]);
        else if (message.reply_to_message.new_chat_participant)
            target = message.reply_to_message.new_chat_participant.id;
        else if (message.reply_to_message.left_chat_participant)
            target = message.reply_to_message.left_chat_participant.id;
        else
            target = message.reply_to_message.from.id;

        db.ignored = db.ignored.filter(id => id !== target);
        reply({
            type: "text",
            text: "Done."
        });
    }
}