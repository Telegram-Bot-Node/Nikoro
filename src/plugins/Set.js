const Plugin = require("./../Plugin");
const Util = require("../Util");

module.exports = class Set extends Plugin {

    static get plugin() {
        return {
            name: "Set",
            description: "Trigger bot responses whenever someone says a specific sentence.",
            help: "`/set <trigger> <response>` to set a trigger, `/unset <trigger>` to delete it.",

            needs: {
                database: true
            }
        };
    }

    start() {
        if (!this.db.replacements)
            this.db.replacements = [];
    }

    onText(message, reply) {
        const chatID = message.chat.id;

        for (const item of this.db.replacements) {
            if (chatID !== item.chatID) continue;
            if (!Util.startsWith(message.text, item.trigger)) continue;
            reply({type: "text", text: item.replacement});
        }
    }

    onCommand({message, command, args}, reply) {
        const chatID = message.chat.id;
        let trigger;
        let replacement;
        switch (command) {
        case "set":
            if (args.length < 2)
                return reply({
                    type: "text",
                    text: "Syntax: `/set <trigger> <replacement>`"
                });

            trigger = args.shift();
            replacement = args.join(" ");
            this.db.replacements.push({trigger, replacement, chatID});
            reply({
                type: "text",
                text: "Done."
            });
            return;
        case "unset":
            trigger = args[0];
            // Take only replacements with either a different chat id or a different trigger
            this.db.replacements = this.db.replacements.filter(item => (item.chatID !== chatID) || (item.trigger !== trigger));
            reply({
                type: "text",
                text: "Done."
            });
            return;
        case "get": {
            let text = "";
            for (const item of this.db.replacements) {
                if (item.chatID !== chatID) continue;
                text += `${item.trigger} => ${item.replacement}\n`;
            }
            if (text === "")
                text = "No triggers set.";
            reply({
                type: "text",
                text
            });
            return;
        }
        default:
            return;
        }
    }
}