const Plugin = require("../Plugin");
const assert = require("assert");
const GoogleSearch = require("google-search");

module.exports = class GoogleImages extends Plugin {
    constructor(obj) {
        super(obj);

        assert("GOOGLE_API_KEY" in obj.config, "string", "You must supply a Google API key.");
        assert.notStrictEqual(obj.config.GOOGLE_API_KEY, "", "Please supply a valid Google API key.");
        assert("GOOGLE_CSE_ID" in obj.config, "string", "You must supply a Google CX key.");
        assert.notStrictEqual(obj.config.GOOGLE_CSE_ID, "", "Please supply a valid Google CX key.");

        this.client = new GoogleSearch({
            key: obj.config.GOOGLE_API_KEY,
            cx: obj.config.GOOGLE_CSE_ID
        });
    }

    static get plugin() {
        return {
            name: "GoogleImages",
            description: "Search for images on Google.",
            help: "/images query",
            needs: {
                config: {
                    GOOGLE_API_KEY: "Google API key",
                    GOOGLE_CSE_ID: "Google CSE ID"
                }
            }
        };
    }

    async onCommand({command, args}) {
        if (command !== "images") return;
        const query = args.join(" ");
        const response = await new Promise((resolve, reject) => this.client.build({q: query, searchtype: "image", num: 1}, (error, response) => error ? reject(error) : resolve(response)));
        if ((!response.items) || (response.items.length === 0))
            return "No results found.";
        const item = response.items[0];
        return {
            type: "photo",
            photo: item.pagemap.cse_image[0].src,
            options: {
                caption: `${item.snippet.replace(/\n/g, "")}`
            }
        };
    }
};