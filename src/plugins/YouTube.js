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

    onCommand({message, command, args}, reply) {
        if (command !== "yt") return;
        const query = args.join(" ");
        YouTube.search.list({
            part: "snippet", // required by YT API
            q: query
        }, function(err, data) {
            if (err)
                return reply({
                    type: "text",
                    text: "An error happened."
                });

            const result = data.items[0];
            reply({
                type: "text",
                text: `[${result.snippet.title}](https://youtube.com/watch?v=${result.id.videoId})\n\n${result.snippet.description}`,
                options: {
                    parse_mode: "Markdown"
                }
            });
        });
    }
};
