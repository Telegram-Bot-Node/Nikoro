const Plugin = require("../Plugin");
const request = require("request");

module.exports = class Reddit extends Plugin {
    static get plugin() {
        return {
            name: "Reddit",
            description: "Get a random post from the Reddit frontpage or a subreddit",
            help: `\`/reddit\` gets a random post; \`/reddit sub\` gets a random post from the subreddit. 
            \`/redimg _subreddit_\` : gets a random image from _subreddit_
            `
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "reddit" && command !== "redimg") {
            return;
        }

        const sub = args[0];
        const url = "https://reddit.com/" + (sub ? `r/${sub}` : "") + ".json";
        request(url, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return reply({
                    type: "text",
                    text: "An error occurred."
                });
            }
            try {
                switch (command) {
                case "reddit":
                    this.reddit(body, reply);
                    break;
                case "redimg":
                    this.redimg(body, reply);
                    break;
                default:
                    return;
                }
            } catch (e) {
                return reply({
                    type: "text",
                    text: "An error occurred."
                });
            }
        });
    }

    reddit(body, reply) {
        const data = JSON.parse(body);
        const results = data.data.children;
        const item = results[Math.floor(Math.random() * results.length)].data;
        reply({
            type: "text",
            text: `[${item.title}](https://reddit.com${item.permalink}) - r/${item.subreddit}`,
            options: {
                parse_mode: "Markdown"
            }
        });
    }

    redimg(body, reply) {
        const data = JSON.parse(body);
        const results = data.data.children
            .map(c => c.data)
            .filter(c => c.post_hint === "image");
        const item = results[Math.floor(Math.random() * results.length)];

        reply({
            type: "photo",
            photo: item.url,
            options: {
                caption: `${item.title}\n\n${item.url}`
            }
        });
    }}

