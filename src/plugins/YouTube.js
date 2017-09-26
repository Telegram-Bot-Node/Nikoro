const Plugin = require("../Plugin");
const YouTube = require("youtube-api");
const assert = require("assert");

module.exports = class YouTubePlugin extends Plugin {

    static get plugin() {
        return {
            name: "YouTube",
            description: "Search for videos on YouTube.",
            help: "/yt query",
            needs: {
                config: {
                    YOUTUBE_API_KEY: "API key for Youtube."
                }
            }
        };
    }

    start(config) {
        this.config = config;
        assert(typeof this.config.YOUTUBE_API_KEY === typeof "", "You must supply a YouTube API key.");
        assert(this.config.YOUTUBE_API_KEY !== "", "Please supply a valid YouTube API key.");
        YouTube.authenticate({
            type: "key",
            key: this.config.YOUTUBE_API_KEY
        });
    }

    onCommand({message, command, args}) {
        if (command !== "yt") return;
        const query = args.join(" ");
        YouTube.search.list({
            part: "snippet", // required by YT API
            q: query
        }, (err, data) => {
            if (err) {
                this.sendMessage(message.chat.id, "An error happened.");
                return;
            }

            const result = data.items[0];
            this.sendMessage(
                message.chat.id,
                `[${result.snippet.title}](https://youtube.com/watch?v=${result.id.videoId})

${result.snippet.description}`,
                {
                    parse_mode: "Markdown"
                }
            );
        });
    }
};
