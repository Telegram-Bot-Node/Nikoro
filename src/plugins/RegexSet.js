import Plugin from "./../Plugin";
import Util from "./../Util";
const safe = require("safe-regex");

export default class RegexSet extends Plugin {

    plugin = {
        name: "RegexSet",
        description: "Regex-capable set command",
        help: 'Examples:\n/set foo - bar\n/regexset fo+ - i - bar',
    };

    constructor(a, b) {
        super(a, b);
        if (!this.db.replacements)
            this.db.replacements = [];
    }

    onText(message, reply) {
        const chatID = message.from.id;
        Object.keys(this.db.replacements).forEach(key => {
            let item = this.db.replacements[key];

            if (chatID != item.chatID) return;

            const matches = message.text.match(item.regex);
            if (!matches) return;

            let replacement = item.text;
            for (let i = 0; i < matches.length; i++) {
                replacement = replacement.replace(new RegExp("\\$" + String(i), "g" + item.flags), matches[i]);
            }
            replacement = replacement.replace(/\$name/g, message.from.first_name);
            replacement = replacement.replace(/\$username/g, message.from.username);
            reply({type: "text", text: replacement});
        });

        this.regexset(message.text, reply, chatID);
        this.regexlist(message.text, reply, chatID);
        this.regexdelete(message.text, reply, chatID);
    };

    regexset(text, reply, chatID) {
        var parts = Util.parseCommand(text, "regexset", {splitBy: '-'});
        if (!parts) return;
        var literal_regex = parts[1],
            flags,
            text;
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
                reply({type: "text", text: "Syntax: /regexset needle - flags - replacement"});
                return;
        }
        try {
            var regex = new RegExp(literal_regex, "g" + flags);
        } catch (e) {
            reply({type: "text", text: "Cannot compile regular expression."});
            return;
        }
        if (!safe(literal_regex)) {
            reply({type: "text", text: "That regular expression seems to be inefficient."});
            return;
        }
        this.db.replacements.push({regex: literal_regex, text, flags, chatID});
        reply({type: "text", text: "Done."});
    }

    regexlist(text, reply) {
        const parts = Util.parseCommand(text, "regexlist", {splitBy: '-'});
        if (!parts) return;
        var string = "";
        for (let ID in this.db.replacements) {
            let item = this.db.replacements[ID];
            string += `${ID}: regex ${item.regex}, text ${item.text}`
        }
        if (this.db.replacements.length == 0) {
            string = "List empty."
        }
        reply({type: "text", text: string});
    }

    regexdelete(text, reply) {
        const parts = Util.parseCommand(text, "regexdelete", {splitBy: '-'});
        if (!parts) return;
        if (parts.length != 2) {
            reply({type: "text", text: "Syntax: /regexdelete ID"});
            return;
        }
        const ID = Number(parts[1]);
        if (this.db.replacements[ID]) {
            this.db.replacements.splice(ID, 1);
            reply({type: "text", text: "Deleted."})            
        } else {
            reply({type: "text", text: "No such expression."})            
        }
    }
};

