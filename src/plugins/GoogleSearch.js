import Plugin from "../Plugin";
import Config from "../../Config";
import Util from "../Util";
import GoogleSearch from "google-search";
import assert from "assert";

var google;

export default class Google extends Plugin {

    get plugin() {
        return {
            name: "Google",
            description: "Search on Google.",
            help: "/google query"
        };
    }

    start() {
        assert(typeof Config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(Config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof Config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(Config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");
        google = new GoogleSearch({
            key: Config.GOOGLE_API_KEY,
            cx: Config.GOOGLE_CX
        });
    }

    onText(message, reply) {
        const parts = Util.parseCommand(message.text, "google");
        if (!parts) return;
        const query = parts.slice(1).join(" ");
        google.build({
            q: query
        }, function(err, response) {
            if (err) {
                reply({
                    type: "text",
                    text: "An error happened."
                });
                return;
            }
            const links = response.items;
            const text = links
                .map(link => `<a href="${link.link}">${link.title}</a>\n\n${link.htmlSnippet}`)
                .join("\n\n")
                .replace(/<br>/g, "\n") // This tag doesn't work in Telegram HTML.
                .replace(/&nbsp;/g, " "); // This entity doesn't work in Telegram HTML.
            reply({
                type: "text",
                text: text,
                options: {
                    parse_mode: "HTML"
                }
            });
        });
    }
}