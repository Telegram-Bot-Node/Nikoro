const Plugin = require("../Plugin");
const Util = require("./../Util");
const assert = require("assert");
const GoogleSearch = require("google-search");

module.exports = class Google extends Plugin {
    constructor(obj) {
        super(obj);

        assert(typeof obj.config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(obj.config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof obj.config.GOOGLE_CSE_ID === typeof "", "You must supply a Google CX key.");
        assert(obj.config.GOOGLE_CSE_ID !== "", "Please supply a valid Google CX key.");
        this.client = new GoogleSearch({
            key: obj.config.GOOGLE_API_KEY,
            cx: obj.config.GOOGLE_CSE_ID
        });
    }

    static get plugin() {
        return {
            name: "Google",
            description: "Search on Google.",
            help: "/google query",
            needs: {
                config: {
                    GOOGLE_API_KEY: "Google API key",
                    GOOGLE_CSE_ID: "Google CSE ID"
                }
            }
        };
    }

    async onCommand({command, args}) {
        if (command !== "google") return;
        const query = args.join(" ");
        const response = await new Promise((resolve, reject) => this.client.build({q: query, num: 5}, (error, response) => error ? reject(error) : resolve(response)));

        return {
            type: "text",
            text: response.items
                .map(({title, link, snippet}) => `${Util.makeHTMLLink(title, link)}\n${snippet.replace(/\n/g, "")}`)
                .join("\n\n"),
            options: {
                disable_web_page_preview: true,
                parse_mode: "HTML"
            }
        };
    }
};