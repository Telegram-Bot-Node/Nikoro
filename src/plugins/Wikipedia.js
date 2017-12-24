const Plugin = require("../Plugin");
const wiki = require("wikijs").default();
const Util = require("./../Util");

module.exports = class Wikipedia extends Plugin {
    static get plugin() {
        return {
            name: "Wikipedia",
            description: "Search articles on Wikipedia.",
            help: "/wiki query"
        };
    }

    async onCommand({command, args}) {
        if (command !== "wiki") return;
        const query = args.join(" ");
        const page = await wiki.page(query);
        const title = page.raw.title;
        const summary = await page.summary();
        return {
            type: "text",
            text: `<b>${Util.escapeHTML(title)}</b>\n\n${Util.escapeHTML(summary)}`,
            options: {
                parse_mode: "HTML"
            }
        };
    }
};
