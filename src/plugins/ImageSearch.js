import Plugin from "../Plugin";
import Config from "../../Config";
import Util from "../Util";
import GoogleImages from "google-images";
import assert from "assert";

var client;

export default class ImageSearch extends Plugin {

    get plugin() {
        return {
            name: "Google Images search",
            description: "Search for images on Google.",
            help: "/images query"
        };
    }

    start() {
        assert(typeof Config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(Config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof Config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(Config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");
        client = new GoogleImages(Config.GOOGLE_CX, Config.GOOGLE_API_KEY);
    }

    onText(message, reply) {
        const parts = Util.parseCommand(message.text, "images");
        if (!parts) return;
        const query = parts.slice(1).join(" ");
        client.search(query).then(images => {
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
}