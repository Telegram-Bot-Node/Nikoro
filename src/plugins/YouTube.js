import Plugin from "../Plugin";
import Config from "../../Config";
import Util from "../Util";
import YouTube from "youtube-api";
import assert from "assert";

export default class YouTubePlugin extends Plugin {

    get plugin() {
        return {
            name: "YouTube",
            description: "Search for videos on YouTube.",
            help: "/yt query"
        };
    }

    start() {
        assert(!!Config.YOUTUBE_API_KEY);
        YouTube.authenticate({
            type: "key",
            key: Config.YOUTUBE_API_KEY
        });
        return Promise.resolve();
    }

    onText(message, reply) {
        const parts = Util.parseCommand(message.text, "yt");
        if (!parts) return;
        const query = parts.slice(1).join(" ");
        YouTube.search.list({
            part: "snippet", // required by YT API
            q: query
        }, function(err, data) {
            if (err) {
                reply({
                    type: "text",
                    text: "An error happened."
                });
                return;
            }
            let result = data.items[0];
            reply({
                type: "text",
                text: `[${result.snippet.title}](https://youtube.com/watch?v=${result.id.videoId})\n\n${result.snippet.description}`,
                options: {
                    parse_mode: "Markdown"
                }
            });
        });
    }
}