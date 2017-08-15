const Plugin = require("../Plugin");
const request = require("request");

module.exports = class Porn extends Plugin {
    static get plugin() {
        return {
            name: "Porn",
            description: "Searches porn.com.",
            help: "`/porn <query>`"
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "porn") return;
        if (args.length === 0)
            return reply({
                type: "text",
                text: "Please enter a search query."
            });

        const query = args.join(" ");
        request(`http://api.porn.com/videos/find.json?search=${encodeURIComponent(query)}`, (err, res, data) => {
            if (err || res.statusCode === 404)
                return reply({
                    type: "text",
                    text: "An error occurred."
                });

            const jsonData = JSON.parse(data);
            if (jsonData.success !== true)
                return reply({
                    type: "text",
                    text: "An error occurred."
                });
            const item = jsonData.result[0];

            const minutes = String(Math.floor(item.duration / 60));
            let seconds = String(item.duration % 60);
            if (String(seconds).length === 1)
                seconds = '0' + seconds;
            reply({
                type: "text",
                text: `[${item.title}](${item.url}) - ${minutes}:${seconds}`,
                options: {
                    parse_mode: "markdown"
                }
            });
        });
    }
}
