const Plugin = require("../Plugin");
const Util = require("./../Util");
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

    onCommand({message, command, args}) {
        if (command !== "reddit" && command !== "redimg")
            return;

        const sub = args[0];
        const url = "https://reddit.com/" + (sub ? `r/${sub}` : "") + ".json";
        request(url, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return this.sendMessage(message.chat.id, "An error occurred.");
            }
            try {
                switch (command) {
                    case "reddit":
                        this.reddit(message, body);
                        break;
                    case "redimg":
                        this.redimg(message, body);
                        break;
                }
            } catch (e) {
                return this.sendMessage(message.chat.id, "An error occurred.");
            }
        });
    }

    reddit(message, body) {
        const data = JSON.parse(body);
        const results = data.data.children;
        const item = results[Math.floor(Math.random() * results.length)].data;
        this.sendMessage(
            message.chat.id,
            `${Util.makeHTMLLink(item.title, "https://reddit.com" + item.permalink)} - r/${item.subreddit}`,
            {
                parse_mode: "HTML"
            }
        );
    }

    redimg(message, body) {
        const data = JSON.parse(body);
        const results = data.data.children
            .map(c => c.data)
            .filter(c => c.post_hint === "image");
        const item = results[Math.floor(Math.random() * results.length)];

        this.sendPhoto(message.chat.id, item.url, {caption: `${item.title}\n\n${item.url}`});
    }
};

