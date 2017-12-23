const Plugin = require("./../Plugin");
const request = require("request-promise-native");

module.exports = class xkcd extends Plugin {
    static get plugin() {
        return {
            name: "xkcd",
            description: "Returns xkcd comics!",
            help: "/xkcd to get the latest xkcd, `/xkcd <comic ID>` to get the xkcd w/ that ID."
        };
    }

    get commands() {
        return {
            xkcd: async ({args}) => {
                let xkcdid = "";
                if (args.length !== 0) {
                    if (isNaN(args[0]))
                        return "Please write a number as the ID.";
                    xkcdid = args[0] + "/";
                }
                const requrl = `https://xkcd.com/${xkcdid}info.0.json`;

                this.log.debug(`Requesting XKCD at ${requrl}`);

                try {
                    const data = await request(requrl);
                    const jsondata = JSON.parse(data);
                    return {
                        type: "photo",
                        photo: jsondata.img
                    };
                } catch (e) {
                    if (e.statusCode === 404)
                        return "Comic strip not found!";
                    return "An error occurred.";
                }
            }
        }
    }
};