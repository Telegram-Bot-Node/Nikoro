const Plugin = require("./../Plugin");
const safe = require("safe-regex");

module.exports = class RegexSet extends Plugin {
    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
        if (!this.db.replacements) {
            this.db.replacements = [];
        }
    }

    static get plugin() {
        return {
            name: "RegexSet",
            description: "Regex-capable set command",
            help: "Commands: `/regexset /regex/flags replacement`, /regexlist\n\nFor example:\n/regexset /fo+/i - bar\n\nDon't forget to escape literal slashes with \"\\/\"."
        };
    }

    onText({message}) {
        const chatID = message.chat.id;

        for (const item of this.db.replacements) {
            if (chatID !== item.chatID) continue;
            const matches = message.text.match(new RegExp(item.regex, item.flags));
            if (!matches) continue;

            let replacement = item.text;

            for (let i = 0; i < matches.length; i++)
                replacement = replacement.replace(
                    new RegExp("\\$" + i, "g"),
                    matches[i]
                );
            replacement = replacement.replace(/\$name/g, message.from.first_name);
            replacement = replacement.replace(/\$username/g, message.from.username);
            replacement = replacement.replace(/\$text/g, message.text);

            this.sendMessage(message.chat.id, replacement);
        }
    }

    onCommand({message, command, args}) {
        switch (command) {
            case "regexdelete":
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                return this.regexdelete(args, message.chat.id);
            case "regexlist":
                return this.regexlist(message.chat.id);
            case "regexset": {
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                return this.regexset(args, message.chat.id);
            }
        }
    }

    regexset(args, chatID) {
        const helpText = "Syntax: `/regexset /regex/flags replacement` (see `/help RegexSet` for more information)";
        if (args.length < 2)
            return helpText;
        const replacement = args.pop();
        const literalRegex = args.join(" ");

        const metaRegex = /^\/(.+)\/([a-z]*)$/i; // Regex for a valid regex
        if (!metaRegex.test(literalRegex))
            return helpText;

        // eslint-disable-next-line no-unused-vars
        const [_, regexBody, flags] = literalRegex.match(metaRegex);

        try {
            RegExp(regexBody, flags);
        } catch (e) {
            return "Cannot compile regular expression: " + e;
        }

        if (!safe(regexBody))
            return "That regular expression seems to be inefficient.";

        this.db.replacements.push({regex: regexBody, text: replacement, flags, chatID});
        return "Done.";
    }

    regexlist(chatID) {
        const string = this.db.replacements
            .filter(item => item.chatID === chatID)
            .map(item => ` - /${item.regex}/${item.flags} -> ${item.text}`)
            .join("\n") || "No items set for this chat.";
        return string + "\n\nTo delete a regular expression, use /regexdelete /regex/flags.";
    }

    regexdelete(args, chatID) {
        if (args.length === 0)
            return "Syntax: /regexdelete /regex/flags";

        const literalRegex = args.join(" ");

        const metaRegex = /^\/(.+)\/([a-z]*)$/i; // Regex for a valid regex
        if (!metaRegex.test(literalRegex))
            return "Syntax: /regexdelete /regex/flags";

        // eslint-disable-next-line no-unused-vars
        const [_, regexBody, flags] = literalRegex.match(metaRegex);

        const find = obj => (obj.regex === regexBody) && (obj.flags === flags) && (obj.chatID === chatID);
        if (!this.db.replacements.some(find))
            return "No such expression.";
        const i = this.db.replacements.findIndex(obj => find(obj));

        this.db.replacements.splice(i, 1);
        return "Deleted.";
    }
};