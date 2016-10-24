import Plugin from "../Plugin";
import request from "request";

export default class Reddit extends Plugin {
    static get plugin() {
        return {
            name: "Reddit",
            description: "Get a random post from the Reddit frontpage or a subreddit",
            help: "`/reddit` gets a random post; `/reddit sub` gets a random post from the subreddit."
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "reddit") return;
        const sub = args[0];
        const url = "https://reddit.com" + (sub ? `/r/${sub}` : "") + "/.json";
        request(url, (error, response, body) => {
            if (error || response.statusCode !== 200)
                return reply({
                    type: "text",
                    text: "An error occurred."
                });
            try {
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
            } catch (e) {
                return reply({
                    type: "text",
                    text: "An error occurred."
                });
            }
        });
    }
}
