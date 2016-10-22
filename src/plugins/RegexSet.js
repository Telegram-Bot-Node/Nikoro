import Plugin from "./../Plugin";
const safe = require("safe-regex");

export default class RegexSet extends Plugin {

    static get plugin() {
        return {
            name: "RegexSet",
            description: "Regex-capable set command",
            help: 'Examples:\n/set foo - bar\n/regexset fo+ - i - bar',

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
            const flags = "g" + item.flags;
            const matches = message.text.match(new RegExp(item.regex, flags));
            if (!matches) continue;

            let replacement = item.text;
            replacement = replacement.replace(/$0/g, replacement);
            for (let i = 0; i < matches.length; i++) {
                console.log(i, matches[i]);
                replacement = replacement.replace(
                    new RegExp("\\$" + String(i + 1), "g"),
                    matches[i]
                );
            }
            replacement = replacement.replace(/\$name/g, message.from.first_name);
            replacement = replacement.replace(/\$username/g, message.from.username);
            reply({type: "text", text: replacement});
        }
    }

    onCommand({message, command, args}, reply) {
        const chatID = message.chat.id;
        switch (command) {
        case "regexset":
            this.regexset(args, reply, chatID);
            return;
        case "regexlist":
            this.regexlist(args, reply, chatID);
            return;
        case "regexdelete":
            this.regexdelete(args, reply, chatID);
            return;
        default:
            return;
        }
    }

    regexset(args, reply, chatID) {
        const literalRegex = args[0];
        let flags;
        let text;
        switch (args.length) {
        case 2:
            flags = "";
            text = args[1];
            break;
        case 3:
            flags = args[1];
            text = args[2];
            break;
        default:
            reply({
                type: "text",
                text: "Syntax: /regexset needle - flags - replacement"
            });
            return;
        }

        try {
            RegExp(literalRegex, "g" + flags);
        } catch (e) {
            reply({type: "text", text: "Cannot compile regular expression."});
            return;
        }

        if (!safe(literalRegex))
            return reply({
                type: "text",
                text: "That regular expression seems to be inefficient."
            });

        this.db.replacements.push({regex: literalRegex, text, flags, chatID});
        reply({type: "text", text: "Done."});
    }

    regexlist(args, reply, chatID) {
        if (this.db.replacements.length === 0) {
            reply({type: "text", text: "List empty."});
            return;
        }

        let string = "";
        this.db.replacements.forEach((item, ID) => {
            if (chatID !== item.chatID) return;
            string += `${ID}: "${item.regex}" -> "${item.text}"\n`;
        });
        if (string === "")
            reply({type: "text", text: "No items set for this chat."});
        else
            reply({type: "text", text: string});
    }

    regexdelete(args, reply, chatID) {
        if (args.length !== 1) {
            reply({type: "text", text: "Syntax: /regexdelete ID"});
            return;
        }

        const ID = Number(args[0]);
        if (!this.db.replacements[ID]) {
            reply({type: "text", text: "No such expression."});
            return;
        }
        if (this.db.replacements[ID].chatID !== chatID) {
            reply({type: "text", text: "No such item in this chat."});
            return;
        }

        this.db.replacements.splice(ID, 1);
        reply({type: "text", text: "Deleted."});
    }
}