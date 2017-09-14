const Plugin = require("./../Plugin");
const Util = require("../Util");

module.exports = class Set extends Plugin {

    static get plugin() {
        return {
            name: "Set",
            description: "Trigger bot responses whenever someone says a specific sentence.",
            help: "`/set <trigger> <response>` to set a trigger, `/unset <trigger>` to delete it."
        };
    }

    start() {
        if (!this.db.replacements)
            this.db.replacements = [];
    }

    onText({message}) {
        const chatID = message.chat.id;

        for (const item of this.db.replacements) {
            if (chatID !== item.chatID) continue;
            if (!Util.startsWith(message.text, item.trigger)) continue;
            this.sendMessage(message.chat.id, item.replacement);
        }
    }

    onCommand({message, command, args}) {
        const chatID = message.chat.id;
        let trigger;
        let replacement;
        switch (command) {
        case "set":
            if (args.length < 2)
                return this.sendMessage(message.chat.id, "Syntax: `/set <trigger> <replacement>`");

            trigger = args.shift();
            replacement = args.join(" ");
            this.db.replacements.push({trigger, replacement, chatID});
            this.sendMessage(message.chat.id, "Done.");
            return;
        case "unset":
            trigger = args[0];
            // Take only replacements with either a different chat id or a different trigger
            this.db.replacements = this.db.replacements.filter(item => (item.chatID !== chatID) || (item.trigger !== trigger));
            this.sendMessage(message.chat.id, "Done.");
            return;
        case "get": {
            let text = "";
            for (const item of this.db.replacements) {
                if (item.chatID !== chatID) continue;
                text += `${item.trigger} => ${item.replacement}\n`;
            }
            if (text === "")
                text = "No triggers set.";
            this.sendMessage(message.chat.id, text);
            return;
        }
        default:
            return;
        }
    }
};