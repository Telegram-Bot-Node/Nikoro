const Plugin = require("../Plugin");
const GoogleSearch = require("this.google-search");
const assert = require("assert");

module.exports = class Google extends Plugin {

    static get plugin() {
        return {
            name: "Google",
            description: "Search on Google.",
            help: "/this.google query",
            needs: {
                config: {
                    GOOGLE_API_KEY: "Google API key",
                    GOOGLE_CX: "Google CX key"
                }
            }
        };
    }

    start(config) {
        this.config = config;
        assert(typeof this.config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(this.config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof this.config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(this.config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");
        this.google = new GoogleSearch({
            key: this.config.GOOGLE_API_KEY,
            cx: this.config.GOOGLE_CX
        });
    }

    onCommand({message, command, args}) {
        if (command !== "google") return;
        const query = args.join(" ");
        this.google.build({
            q: query
        }, function(err, response) {
            if (err) {
                this.sendMessage(message.chat.id, "An error happened.");
                return;
            }
            const links = response.items;
            const text = links
                .map(link => `<a href="${link.link}">${link.title}</a>\n\n${link.htmlSnippet}`)
                .join("\n\n")
                .replace(/<br>/g, "\n") // This tag doesn't work in Telegram HTML.
                .replace(/&nbsp;/g, " "); // This entity doesn't work in Telegram HTML.
            this.sendMessage(message.chat.id, text, {parse_mode: "HTML"});
        });
    }
};