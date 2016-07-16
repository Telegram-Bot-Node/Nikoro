import Plugin from "./../Plugin";
import Util from "./../Util";
const safe = require("safe-regex");

export default class RegexSet extends Plugin {

    get plugin() {
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

        return Promise.resolve();
    }

    onText(message, reply) {
        const chatID = message.chat.id;
        Object.keys(this.db.replacements).forEach(key => {
            let item = this.db.replacements[key];

            if (chatID !== item.chatID) return;

            const matches = message.text.match(item.regex);
            if (!matches) return;

            let replacement = item.text;
            for (let i = 0; i < matches.length; i++) {
                replacement = replacement.replace(
                    new RegExp("\\$" + String(i), "g" + item.flags),
                    matches[i]
                );
            }
            /* eslint-disable max-len */
            replacement = replacement.replace(/\$name/g, message.from.first_name);
            replacement = replacement.replace(/\$username/g, message.from.username);
            /* eslint-enable max-len */
            reply({type: "text", text: replacement});
        });

        this.regexset(message.text, reply, chatID);
        this.regexlist(message.text, reply, chatID);
        this.regexdelete(message.text, reply, chatID);
    }

    regexset(body, reply, chatID) {
        var parts = Util.parseCommand(body, "regexset", {splitBy: '-'});
        if (!parts) return;
        var literalRegex = parts[1];
        var flags;
        var text;
        switch (parts.length) {
        case 3:
            flags = "";
            text = parts[2];
            break;
        case 4:
            flags = parts[2];
            text = parts[3];
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
        if (!safe(literalRegex)) {
            reply({
                type: "text",
                text: "That regular expression seems to be inefficient."
            });
            return;
        }
        this.db.replacements.push({regex: literalRegex, text, flags, chatID});
        reply({type: "text", text: "Done."});
    }

    regexlist(text, reply) {
        const parts = Util.parseCommand(text, "regexlist", {splitBy: '-'});
        if (!parts) return;
        if (this.db.replacements.length === 0) {
            reply({type: "text", text: "List empty."});
            return;
        }

        var string = "";
        for (let ID in this.db.replacements) {
            // Rejects "internal" properties
            if (!this.db.replacements.hasOwnProperty(ID)) continue;
            let item = this.db.replacements[ID];
            string += `${ID}: regex ${item.regex}, text ${item.text}`;
        }
        reply({type: "text", text: string});
    }

    regexdelete(text, reply) {
        const parts = Util.parseCommand(text, "regexdelete", {splitBy: '-'});
        if (!parts) return;
        if (parts.length !== 2) {
            reply({type: "text", text: "Syntax: /regexdelete ID"});
            return;
        }

        const ID = Number(parts[1]);
        if (!this.db.replacements[ID]) {
            reply({type: "text", text: "No such expression."});
            return;
        }

        this.db.replacements.splice(ID, 1);
        reply({type: "text", text: "Deleted."});
    }
}