/* eslint no-console: 0 no-sync: 0 */
/* Run this tool and send "#help" for usage details.
*/

const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

process.env.IS_TEST_ENVIRONMENT = 1;
process.env.MOCK_NTBA = "../tests/integration/helpers/TelegramBot.js";
const API = require("../src/Bot.js");

API.on("_debug_message", ({text}) => {
    const [first, ...rest] = text.split("\n");
    console.log("< " + first);
    for (const line of rest)
        console.log("| " + line);
});

let chatID = 1;
let myUID = 1;
let myUname = "dev";
let myName = "Dev";

rl.on("line", text => {
    if (text.startsWith("#")) {
        if (text === "#quit" || text === "#exit")
            process.exit(0);
        if (text === "#help")
            console.log(
`This is a tool for testing Nikoro. It emulates the Telegram API: any message
you type below will appear to the bot as if it came from Telegram.

Commands prefixed with "#" are for internal usage, and won't be seen by the bot.

Commands:
    #help to show this help text.
    #chatid <ID> to change the chat ID to <ID> (current value: ${chatID}, default value 1).
    #myuid <ID> to change your user ID to <ID> (current value: ${myUID}, default value 1).
    #myuname <username> to change your username to <username> (current value: ${myUname}, default value "dev").
    #myname <name> to change your name to <name> (current value: ${myName}, default value "Dev").
    #quit to quit the tool.
`);
        if (text.startsWith("#myuid "))
            myUID = Number(text.replace(/#myuid /, ""));
        if (text.startsWith("#myuname "))
            myUname = Number(text.replace(/#myuname /, ""));
        if (text.startsWith("#myname "))
            myName = Number(text.replace(/#myname /, ""));
    } else {
        API.pushMessage({
            text,
            from: {
                id: myUID,
                first_name: myName,
                username: myUname
            },
            chat: {
                id: chatID,
                title: "Dev group",
                type: "group",
                all_members_are_administrators: false
            }
        });
    }
});