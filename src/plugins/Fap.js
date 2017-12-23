const Plugin = require("../Plugin");
const Util = require("./../Util");
const request = require("request-promise-native");

module.exports = class Porn extends Plugin {
    static get plugin() {
        return {
            name: "Porn",
            description: "Searches porn.com.",
            help: "`/porn <query>`"
        };
    }

    async onCommand({command, args}) {
        if (command !== "porn") return;
        if (args.length === 0)
            return "Please enter a search query.";

        const query = args.join(" ");
        const data = JSON.parse(await request(`http://api.porn.com/videos/find.json?search=${encodeURIComponent(query)}`));
        if (data.success !== true)
            throw new Error("An error occurred.");

        const item = data.result[0];
        const minutes = String(Math.floor(item.duration / 60));
        let seconds = String(item.duration % 60);
        if (String(seconds).length === 1)
            seconds = "0" + seconds;

        return {
            type: "text",
            text: `${Util.makeHTMLLink(item.title, item.url)} - ${minutes}:${seconds}`,
            options: {
                parse_mode: "HTML"
            }
        };
    }
};
