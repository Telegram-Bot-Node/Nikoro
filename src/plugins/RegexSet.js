const Plugin = require("./../Plugin");
const safe = require("safe-regex");

module.exports = class RegexSet extends Plugin {

    static get plugin() {
        return {
            name: "RegexSet",
            description: "Regex-capable set command",
            help: 'Syntax: `/regexset trigger - flags - replacement`, or `/regexset trigger - replacement`\nExamples:\n/regexset fo+ - i - bar',
            help: 'Examples:\n/set foo - bar\n/regexset fo+ - i - bar'
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

    get commands() { return {
        regexdelete: ({message, args}) => {
            if (!this.auth.isMod(message.from.id, message.chat.id))
                return "RegexSet is restricted to mods.";
            return this.regexdelete(args, message.chat.id);
        },
        regexlist: ({message}) => this.regexlist(message.chat.id),
        regexset: ({message, args}) => {
            if (!this.auth.isMod(message.from.id, message.chat.id))
                return "RegexSet is restricted to mods.";
            return this.regexset(args, message.chat.id);
        }
    };}

    regexset(args, chatID) {
        const literalRegex = args[0];
        let flags;
        let text;

        if (args.length === 3) {
            flags = "";
            text = args[2];
        } else if (args.length === 5) {
            flags = args[2];
            text = args[4];
        } else return "Syntax: /regexset needle - flags - replacement";

        try {
            RegExp(literalRegex, "g" + flags);
        } catch (e) {
            return "Cannot compile regular expression.";
        }

        if (!safe(literalRegex))
            return "That regular expression seems to be inefficient.";

        this.db.replacements.push({regex: literalRegex, text, flags, chatID});
        return "Done.";
    }

    regexlist(chatID) {
        const string = this.db.replacements
            .filter(item => item.chatID === chatID)
            .map((item, ID) => `${ID}: "${item.regex}" -> "${item.text}"`)
            .join("\n");
        return string || "No items set for this chat.";
    }

    regexdelete(args, chatID) {
        if (args.length !== 1)
            return "Syntax: /regexdelete ID";

        const ID = Number(args[0]);
        if (!this.db.replacements[ID])
            return "No such expression.";
        if (this.db.replacements[ID].chatID !== chatID)
            return "No such item in this chat.";

        this.db.replacements.splice(ID, 1);
        return "Deleted.";
    }
};