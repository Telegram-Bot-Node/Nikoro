const Plugin = require("../Plugin");
const request = require("request");

module.exports = class Rule34 extends Plugin {
    static get plugin() {
        return {
            name: "Rule34",
            description: "If it exists, there's porn of it.",
            help: "/rule34 <query>"
        };
    }

    onCommand({message, command, args}) {
        if (command !== "rule34") return;
        if (args.length === 0)
            return this.sendMessage(message.chat.id, "Please enter a search query.");
        const query = args.join("+");
        this.log.debug(`Search query: ${query}`);

        this.log.debug(`URL: https://rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&tags=${encodeURIComponent(query)}`);

        request(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&tags=${encodeURIComponent(query).replace("%2B", "+")}`, (err, res, data) => {
            if (err || res.statusCode === 404)
                return this.sendMessage(message.chat.id, "An error occurred.");

            this.log.debug(`Received: ${data}`);

            const regexp = /file_url="(?:https?:)?(\/\/img\.rule34\.xxx\/images\/\d+\/[0-9a-f]+\.\w+)"/i;

            const imgurlarr = data.match(regexp);

            this.log.debug("Matches: " + JSON.stringify(imgurlarr));

            if (imgurlarr === null || imgurlarr.length === 0)
                return this.sendMessage(message.chat.id, "No results found.");

            const target = "https:" + imgurlarr[1];

            this.log.debug(`Target URL: ${target}`);

            this.sendPhoto(message.chat.id, target);
        });
    }
};