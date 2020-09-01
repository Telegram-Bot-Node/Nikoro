const Plugin = require("../Plugin");
const Util = require("./../Util");
const request = require("request-promise-native");

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

    async onCommand({message, command, args}) {
        if (command !== "reddit" && command !== "redimg")
            return;

        const sub = args[0];
        const body = await request("https://reddit.com/" + (sub ? `r/${sub}` : "") + ".json");
        const results = JSON.parse(body).data.children;
        switch (command) {
            case "reddit":
                return Reddit.reddit(message, results);
            case "redimg":
                return Reddit.redimg(message, results);
        }
    }

    static reddit(message, results) {
        const item = results[Math.floor(Math.random() * results.length)].data;
        return {
            type: "text",
            text: `${Util.makeHTMLLink(item.title, "https://reddit.com" + item.permalink)} - r/${item.subreddit}`,
            options: {
                parse_mode: "HTML"
            }
        };
    }

    static redimg(message, results) {   
        results = results
            .map(c => c.data)
            .filter(c => c.post_hint === "image");

        if(results.length == 0 ) return "subreddit not found"

        const item = results[Math.floor(Math.random() * results.length)];
        return {
            type: "photo",
            photo: item.url,
            options: {
                caption: `${item.title}\n\n${item.url}`
            }
        };
    }
};

