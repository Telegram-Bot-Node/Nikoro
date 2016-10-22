import Plugin from "../Plugin";
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));
import GoogleSearch from "this.google-search";
import assert from "assert";

export default class Google extends Plugin {

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

    google = null;

    start() {
        assert(typeof Config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(Config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof Config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(Config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");
        this.google = new GoogleSearch({
            key: Config.GOOGLE_API_KEY,
            cx: Config.GOOGLE_CX
        });
    }

    onCommand({message, command, args}, reply) {
        if (command !== "google") return;
        const query = args.join(" ");
        this.google.build({
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