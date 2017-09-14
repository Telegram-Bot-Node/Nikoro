const Plugin = require("./../Plugin");
const safe = require("safe-regex");

module.exports = class RegexSet extends Plugin {

    static get plugin() {
        return {
            name: "RegexSet",
            description: "Regex-capable set command",
            help: 'Syntax: `/regexset trigger - flags - replacement`, or `/regexset trigger - replacement`\nExamples:\n/regexset fo+ - i - bar'
        };
    }

    start(config, auth) {
        this.auth = auth;
        if (!this.db.replacements)
            this.db.replacements = [];
    }

    onText({message}) {
        const chatID = message.chat.id;

        for (const item of this.db.replacements) {
            if (chatID !== item.chatID) continue;
            const flags = "g" + item.flags;
            const matches = message.text.match(new RegExp(item.regex, flags));
            if (!matches) continue;

            let replacement = item.text;
            replacement = replacement.replace(/$0/g, replacement);
            for (let i = 0; i < matches.length; i++)
                replacement = replacement.replace(
                    new RegExp("\\$" + String(i + 1), "g"),
                    matches[i]
                );
            replacement = replacement.replace(/\$name/g, message.from.first_name);
            replacement = replacement.replace(/\$username/g, message.from.username);
            this.sendMessage(message.chat.id, replacement);
        }
    }

    onCommand({message, command, args}) {
        const chatID = message.chat.id;
        const author = message.from.id;
        switch (command) {
        case "regexset":
            if (!this.auth.isMod(author, chatID))
                return this.sendMessage(message.chat.id, "RegexSet is restricted to mods.");
            this.regexset(message, args, chatID);
            return;
        case "regexlist":
            this.regexlist(message, args, chatID);
            return;
        case "regexdelete":
            if (!this.auth.isMod(author, chatID))
                return this.sendMessage(message.chat.id, "RegexSet is restricted to mods.");
            this.regexdelete(message, args, chatID);
            return;
        default:
            return;
        }
    }

    regexset(message, parts, chatID) {
        // "Split" the parts array by "-"
        let args = [[]];
        let currentArg = 0;
        for (const part of parts) {
            if (part === "-") {
                args.push([]);
                currentArg++;
            } else {
                args[currentArg].push(part);
            }
        }
        args = args.map(arr => arr.join(" "));

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
            this.sendMessage(message.chat.id, "Syntax: /regexset needle [- flags] - replacement");
            return;
        }

        try {
            RegExp(literalRegex, "g" + flags);
        } catch (e) {
            this.sendMessage(message.chat.id, "Cannot compile regular expression.");
            return;
        }

        if (!safe(literalRegex))
            return this.sendMessage(message.chat.id, "That regular expression seems to be inefficient.");

        this.db.replacements.push({regex: literalRegex, text, flags, chatID});
        this.sendMessage(message.chat.id, "Done.");
    }

    regexlist(message, args, chatID) {
        if (this.db.replacements.length === 0) {
            this.sendMessage(message.chat.id, "List empty.");
            return;
        }

        let string = "";
        this.db.replacements.forEach((item, ID) => {
            if (chatID !== item.chatID) return;
            string += `${ID}: "${item.regex}" -> "${item.text}"\n`;
        });
        if (string === "")
            this.sendMessage(message.chat.id, "No items set for this chat.");
        else
            this.sendMessage(message.chat.id, string);
    }

    regexdelete(message, args, chatID) {
        if (args.length !== 1) {
            this.sendMessage(message.chat.id, "Syntax: /regexdelete ID");
            return;
        }

        const ID = Number(args[0]);
        if (!this.db.replacements[ID]) {
            this.sendMessage(message.chat.id, "No such expression.");
            return;
        }
        if (this.db.replacements[ID].chatID !== chatID) {
            this.sendMessage(message.chat.id, "No such item in this chat.");
            return;
        }

        this.db.replacements.splice(ID, 1);
        this.sendMessage(message.chat.id, "Deleted.");
    }
};