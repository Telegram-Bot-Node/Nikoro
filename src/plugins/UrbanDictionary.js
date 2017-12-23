const Plugin = require("../Plugin");
const Util = require("./../Util");
const request = require("request-promise-native");

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
            ud: async ({args}) => {
                if (args.length === 0)
                    return "Please provide a search term after /ud.";

                const query = args.join(" ");

                const response = await request(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`);
                const data = JSON.parse(response);
                if (data.result_type === "no_results")
                    return `Sorry, I was unable to find results for "${args.join(" ")}".`;
                /* data.list will be an array, it seems like typically
                   the most popular defintion is at the zero index though.
                */
                const def = data.list[0];
                return {
                    type: "text",
                    text: `<b>${Util.escapeHTML(def.word)}</b>: `
                        + `${Util.escapeHTML(def.definition)}\n\n`
                        + `<i>${Util.escapeHTML(def.example)}</i>`,
                    options: {
                        parse_mode: "HTML"
                    }
                };
            }
        };
    }
};