const fs = require("fs");
const path = require("path");
const Plugin = require("./../Plugin");

const githubURL = "https://github.com/crisbal/Telegram-Bot-Node";
let commit = "";
if (fs.existsSync(path.join(__dirname, "../../.git")))
    commit = fs.readFileSync(path.join(__dirname, "../../.git/refs/heads/es6"), "utf8").substr(0, 7);

module.exports = class Ping extends Plugin {

    static get plugin() {
        return {
            name: "Version",
            description: "Displays useful informations about the bot.",
            help: "Use /version."
        };
    }

    get commands() { return {
        version: () => ({
            type: "text",
            text: `*Telegram-Bot-Node* v${require("../../package.json").version} ${commit}
An open source, plugin-based Telegram Bot written in Node.js. MIT licensed.

[Fork me on GitHub!](${githubURL})`,
            options: {
                disable_web_page_preview: true,
                parse_mode: "Markdown"
            }
        })
    }; }

};
