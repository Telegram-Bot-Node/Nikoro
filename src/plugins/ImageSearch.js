import Plugin from "../Plugin";
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));
import Util from "../Util";
import GoogleImages from "google-images";
import assert from "assert";

export default class ImageSearch extends Plugin {

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

    client = null;

    start() {
        assert(typeof Config.GOOGLE_API_KEY === typeof "", "You must supply a Google API key.");
        assert(Config.GOOGLE_API_KEY !== "", "Please supply a valid Google API key.");
        assert(typeof Config.GOOGLE_CX === typeof "", "You must supply a Google CX key.");
        assert(Config.GOOGLE_CX !== "", "Please supply a valid Google CX key.");

        this.client = new GoogleImages(Config.GOOGLE_CX, Config.GOOGLE_API_KEY);
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
}