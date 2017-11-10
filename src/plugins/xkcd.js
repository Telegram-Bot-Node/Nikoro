const Plugin = require("./../Plugin");
const request = require("request");

module.exports = class xkcd extends Plugin {
    static get plugin() {
        return {
            name: "xkcd",
            description: "Returns xkcd comics!",
            help: "/xkcd to get the latest xkcd, `/xkcd <comic ID>` to get the xkcd w/ that ID."
        };
    }

    onCommand({message, command, args}) {
        if (command !== "xkcd") return;
        let xkcdid = "";
        if (args.length !== 0) {
            xkcdid = args[0] + "/";
            if (isNaN(args[0]))
                return this.sendMessage(message.chat.id, "Please write a number as the ID.");
        }
        const requrl = `https://xkcd.com/${xkcdid}info.0.json`;

        this.log.debug(`Requesting XKCD at ${requrl}`);

        request(requrl, (err, res, data) => {
            if (err)
                return this.sendMessage(message.chat.id, "An error occurred.");
            if (res.statusCode === 404)
                return this.sendMessage(message.chat.id, "Comic strip not found!");

            const jsondata = JSON.parse(data);

            return this.sendPhoto(message.chat.id, jsondata.img);
        });
    }
};