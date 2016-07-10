import Plugin from "./../Plugin";
import Util from "./../util";
const safe = require("safe-regex");

export default class RegexSet extends Plugin {

    plugin = {
        name: "RegexSet",
        description: "Regex-capable set command",
        help: 'Examples:\n/set foo - bar\n/regexset fo+ - i - bar',
    };

    replacements = [];

    onText(message, reply) {
        for (let item of this.replacements) {
            const matches = message.text.match(item.regex);
            if (!matches) continue;
            var replacement = item.text;
            for (let i = 0; i < matches.length; i++) {
                replacement = replacement.replace(new RegExp("\\$" + String(i), "g"), matches[i]);
            }
            if (message.text.match(item.regex))
                reply({type: "text", text: replacement});
        }

        this.regexset(message.text, reply);
        this.regexlist(message.text, reply);
        this.regexdelete(message.text, reply);
    };

    regexset(text, reply) {
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
            var regex = new RegExp(literal_regex, flags);
        } catch (e) {
            reply({type: "text", text: "Cannot compile regular expression."});
            return;
        }
        if (!safe(literal_regex)) {
            reply({type: "text", text: "That regular expression seems to be inefficient."});
            return;
        }
        this.replacements.push({regex: literal_regex, text});
        reply({type: "text", text: "Done."});
    }

    regexlist(text, reply) {
        const parts = Util.parseCommand(text, "regexlist", {splitBy: '-'});
        if (!parts) return;
        var string = "";
        for (let ID in this.replacements) {
            let item = this.replacements[ID];
            console.log(ID, item);
            string += `${ID}: regex ${item.regex}, text ${item.text}`
        }
        if (this.replacements.length == 0) {
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
        if (this.replacements[ID]) {
            this.replacements.splice(ID, 1);
            reply({type: "text", text: "Deleted."})            
        } else {
            reply({type: "text", text: "No such expression."})            
        }
    }
};

