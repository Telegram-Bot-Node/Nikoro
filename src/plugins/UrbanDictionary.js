const Plugin = require("../Plugin");
const Util = require("./../Util");
const request = require("request-promise");

module.exports = class UrbanDictionary extends Plugin {
    static get plugin() {
        return {
            name: "UrbanDictionary",
            description: "Fetches the Urban Dictionary definition for a supplied word or phrase.",
            help: "`/ud <query>` returns the definition for a given word or phrase"
        };
    }

    get commands() {
        return {
            ud: ({args, message}) => {
                if (args.length === 0) {
                    this.sendMessage(message.chat.id, "Please provide a search term after /ud");
                    return;
                }

                const query = args.join(" ");

                request(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`)
                    .then(response => {
                        const data = JSON.parse(response);
                        /* data.list will be an array, it seems like typically
                           the most popular defintion is at the zero index though.
                        */
                        const def = data.list[0];
                        const opts = {parse_mode: "Markdown"};
                        let msg;

                        if (data.result_type === "no_results") {
                            msg = `Sorry, I was unable to find results for: ${args.join(" ")}.`;
                        } else {
                            msg =
                                `<b>${Util.escapeHTML(def.word)}</b>: `
                                + `${Util.escapeHTML(def.definition)}\n\n`
                                + `<i>${Util.escapeHTML(def.example)}</i>`;
                        }

                        this.sendMessage(message.chat.id, msg, opts);
                    })
                    .catch(err => {
                        this.sendMessage(message.chat.id, "An error occured.");
                        this.log.error(`An error occured. The returned error was: ${JSON.parse(err)}`);
                    });
            }
        };
    }
};