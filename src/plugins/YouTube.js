const Plugin = require("../Plugin");
const YouTube = require("youtube-api");
const assert = require("assert");

function sanitize(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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

    constructor(obj) {
        super(obj);

        assert(typeof obj.config.YOUTUBE_API_KEY === typeof "", "You must supply a YouTube API key.");
        assert(obj.config.YOUTUBE_API_KEY !== "", "Please supply a valid YouTube API key.");

        YouTube.authenticate({
            type: "key",
            key: obj.config.YOUTUBE_API_KEY
        });
    }

    get commands() {
        return {
            yt: async ({args}) => {
                const query = args.join(" ");

                const data = await new Promise((resolve, reject) => YouTube.search.list({
                    part: "snippet", // required by YT API
                    q: query
                }, (err, data) => err ? reject(err) : resolve(data)));

                if (data.items.length === 0)
                    return "No videos found!";

                const result = data.items[0];
                const title = sanitize(result.snippet.title);
                const description = sanitize(result.snippet.description);

                return {
                    type: "text",
                    text: `<a href="https://youtube.com/watch?v=${result.id.videoId}">${title}</a>\n\n${description}`,
                    options: {
                        parse_mode: "HTML"
                    }
                };
            }
        }
    }
};
