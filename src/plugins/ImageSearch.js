const Plugin = require("../Plugin");
const Util = require("../Util");
const GoogleImages = require("google-images");
const assert = require("assert");

module.exports = class ImageSearch extends Plugin {

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

    start(config) {
        this.config = config;
        assert(typeof this.config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(this.config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof this.config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(this.config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");

        this.client = new GoogleImages(this.config.GOOGLE_CX, this.config.GOOGLE_API_KEY);
    }

    onCommand({message, command, args}, reply) {
        if (command !== "images") return;
        const query = args.join(" ");
        this.client.search(query).then(images => {
            const url = images[0].url;
            Util.downloadAndSaveTempResource(
                url,
                url.match(/\.([\w]+)$/)[1],
                path => reply({
                    type: "photo",
                    photo: path
                })
            );
        }).catch(err => reply({
            type: "text",
            text: JSON.stringify(err, null, 4)
        }));
    }
};