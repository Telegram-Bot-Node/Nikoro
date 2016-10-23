import Plugin from "../Plugin";
// import Auth from "../helpers/Auth";

export default class Ignore extends Plugin {

    static get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <username>",

            visibility: Plugin.Visibility.VISIBLE,
            type: Plugin.Type.NORMAL | Plugin.Type.PROXY,

            needs: {
                database: true
            }
        };
    }

    proxy(eventName, message) {
        if (this.db.ignored && this.db.ignored.indexOf(message.from.id) !== -1)
            return Promise.reject();

        return Promise.resolve();
    }

    onCommand({message, command, args}, reply) {
        switch (command) {
        case "ignorelist":
            return reply({
                type: "text",
                text: JSON.stringify(this.db.ignored)
            });
        default:
            return;
        }
        // this.ignore(message, reply);
        // this.unignore(message, reply);
    }

    /* ignore(message, reply) {
        const parts = Util.parseCommand(message.text, "ignore");
        if (!parts) return;
        if (!Auth.isMod(message.from.id, message.chat.id)) return;

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

        this.db.ignored.push(target);

        reply({
            type: "text",
            text: "Ignored."
        });
    }

    /*unignore(message, reply) {
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
    }*/
}
