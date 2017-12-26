/* eslint no-sync: 0 */
const fs = require("fs");
const path = require("path");
const Plugin = require("./../Plugin");

const githubURL = "https://github.com/Telegram-Bot-Node/Nikoro";
let commit = "";
if (fs.existsSync(path.join(__dirname, "../../.git"))) {
    const branchRef = fs.readFileSync(path.join(__dirname, "../../.git/HEAD"), "utf8").replace(/^ref: /, "").replace(/\n$/, "");
    commit = fs.readFileSync(path.join(__dirname, "../../.git", branchRef), "utf8").substr(0, 7);
}

module.exports = class Ping extends Plugin {
    static get plugin() {
        return {
            name: "Version",
            description: "Displays useful informations about the bot.",
            help: "Use /version."
        };
    }

    onCommand({command}) {
        if (command !== "version") return;
        return {
            type: "text",
            text: `*Nikoro* v${require("../../package.json").version} ${commit}
An open source, plugin-based Telegram bot written in Node.js. MIT licensed.
[Fork me on GitHub!](${githubURL})`,
            options: {
                disable_web_page_preview: true,
                parse_mode: "Markdown"
            }
        };
    }
};
