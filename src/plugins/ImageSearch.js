const Plugin = require("../Plugin");
const GoogleImages = require("google-images");
const assert = require("assert");

module.exports = class ImageSearch extends Plugin {
    constructor(obj) {
        super(obj);

        assert(typeof obj.config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(obj.config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof obj.config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(obj.config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");

        this.client = new GoogleImages(obj.config.GOOGLE_CX, obj.config.GOOGLE_API_KEY);
    }

    static get plugin() {
        return {
            name: "Google Images search",
            description: "Search for images on Google.",
            help: "/images query",
            needs: {
                config: {
                    GOOGLE_API_KEY: "Google API key",
                    GOOGLE_CX: "Google CX key"
                }
            }
        };
    }

    onCommand({command, args}) {
        if (command !== "images") return;
        const query = args.join(" ");
        return this.client.search(query)
            .then(images => ({type: "photo", photo: images[0].url}));
    }
};