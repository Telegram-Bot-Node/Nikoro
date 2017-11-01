const Plugin = require("../Plugin");
const wiki = require('wikijs').default();

function sanitize(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = class Wikipedia extends Plugin {
    static get plugin() {
        return {
            name: "Wikipedia",
            description: "Search articles on Wikipedia.",
            help: "/wiki query"
        };
    }

    onCommand({message, command, args}) {
        if (command !== "wiki") return;
        const query = args.join(" ");
        wiki.page(query)
            // .raw.title isn't a promise, but .summary is
            .then(page => Promise.all([page.raw.title, page.summary()]))
            .then(([title, summary]) => `<b>${sanitize(title)}</b>\n\n${sanitize(summary)}`)
            .then(text => this.sendMessage(message.chat.id, text, {parse_mode: "HTML"}))
            .catch(err => {
                this.log.error(err);
                this.sendMessage(message.chat.id, "An error occurred.");
            });
    }
};
