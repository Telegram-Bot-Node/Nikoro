const Plugin = require("../Plugin");
const Util = require("./../Util");
const assert = require("assert");
const GoogleSearch = require("google-search");

module.exports = class Google extends Plugin {
    constructor(obj) {
        super(obj);

        assert(typeof obj.config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(obj.config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof obj.config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(obj.config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");
        this.google = new GoogleSearch({
            key: obj.config.GOOGLE_API_KEY,
            cx: obj.config.GOOGLE_CX
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
                    GOOGLE_CX: "Google CX key"
                }
            }
        };
    }

    async onCommand({command, args}) {
        if (command !== "google") return;
        const query = args.join(" ");
        const response = await new Promise((resolve, reject) => this.google.build({
            q: query
        }, (err, response) => err ? reject(err) : resolve(response)));
        return {
            type: "text",
            text: response.items
                .map(Util.makeHTMLLink)
                .join("\n\n"),
            options: {
                parse_mode: "HTML"
            }
        };
    }
};