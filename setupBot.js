/* eslint no-console: 0 */

const fs = require("fs");
const inquirer = require("inquirer");
const Log = require("./src/Log");
const log = Log("Bot", null, "debug");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const walk = require("walk-sync");

// Version reporting, useful for bug reports
let commit = "";
if (fs.existsSync(path.join(__dirname, "./.git")))
    commit = fs.readFileSync(path.join(__dirname, "./.git/refs/heads/es6"), "utf8").substr(0, 7);
log.info(`Nikoro version ${require('./package.json').version}` + (commit ? `, commit ${commit}` : ""));

let token;
let bot;
let admin;
let adminChatId;
const enabledPlugins = new Set();

const configPath = `${__dirname}/config.json`;

inquirer
    .prompt({
        type: "confirm",
        name: "force",
        message: "A configuration file already exists. Would you like to overwrite it?",
        default: false,
        when: function() {
            try {
                JSON.parse(fs.readFileSync(configPath, "utf8"));
                return true;
            } catch (e) {
                return false;
            }
        }
    })
    .then(({force = true}) => {
        if (!force) process.exit(0);
        return inquirer.prompt({
            type: "input",
            name: "TELEGRAM_TOKEN",
            message: "What's the bot token? (You can get one from @BotFather.)",
            validate: token => /\d+:\w+/.test(token) ? true : "Please insert a valid token."
        });
    })
    .then(({TELEGRAM_TOKEN}) => {
        token = TELEGRAM_TOKEN;
        bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

        log.info("The bot is online!");

        log.info("Send a message to your bot to get started.");

        return new Promise(resolve => bot.once("message", resolve));
    })
    .then(msg => {
        admin = msg.from;
        adminChatId = msg.chat.id;
        log.info("Done! Check your Telegram chat.");
        return bot.sendMessage(adminChatId, `Hello, ${admin.first_name}!`);
    })
    .then(() => {
        let msg = "Now, we'll choose the plugins. Here is the list.\n\n";
        const plugins = walk(`${__dirname}/src/plugins`)
            // Use only .js files.
            .filter(item => /\.js$/i.test(item))
            .map(path => {
                // Remove the extension.
                path = path.replace(/\.js$/i, "");
                let plugin;

                try {
                    plugin = require(`./src/plugins/${path}`, false).plugin;
                } catch (e) {
                    return {
                        name: `${path}.js`,
                        disabled: true,
                        message: e.message
                    };
                }

                return {
                    name: plugin.name,
                    disabled: false,
                    message: plugin.description,
                    path
                };
            });
        msg += plugins
            .map(plugin => {
                if (plugin.disabled)
                    return `_${plugin.name}_ - Disabled because: ${plugin.message}`;
                return `*${plugin.name}*: ${plugin.message}`;
            })
            .join("\n");
        const buttons = plugins
            .filter(p => !p.disabled)
            .map(plugin => ({
                text: plugin.name,
                callback_data: plugin.path
            }));
        // We want to put the buttons in two columns.
        const rows = buttons.reduce((rows, button) => {
            const lastRow = rows[rows.length === 0 ? 0 : (rows.length - 1)];
            // If there is space, add a new button
            if (lastRow.length < 2)
                lastRow.push(button);
            // Otherwise, push a new row
            else
                rows.push([button]);
            return rows;
        }, [[]]);
        return bot.sendMessage(adminChatId, msg, {
            parse_mode: "markdown",
            reply_markup: {
                inline_keyboard: rows
            }
        });
    })
    .then(() => bot.sendMessage(adminChatId, "Toggle plugins by clicking on them. When you're done, send /done to proceed."))
    .then(() => {
        bot.on("callback_query", msg => {
            const plugin = msg.data;
            let text;
            if (enabledPlugins.has(plugin)) {
                text = `${plugin} disabled.`;
                enabledPlugins.delete(plugin);
            } else {
                text = `${plugin} enabled.`;
                enabledPlugins.add(plugin);
            }
            bot.answerCallbackQuery({
                callback_query_id: msg.id,
                text
            });
        });
        return new Promise(resolve => bot.on("text", message => {
            if (message.text === "/done")
                resolve();
        }));
    })
    .then(() => {
        const config = {
            TELEGRAM_TOKEN: token,
            owners: [admin.id],
            activePlugins: Array.from(enabledPlugins)
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        const message = "You configured the bot successfully! The setup procedure will now end.";
        log.info(message);
        log.info("You can now run 'npm run bot' to launch the bot.");
        return bot.sendMessage(adminChatId, message);
    })
    .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
    .then(() => process.exit(0))
    .catch(err => {
        if (err) {
            log.error(err);
            log.error("A fatal error occurred. Terminating.");
        }
        process.exit(1);
    });

process.on('unhandledRejection', (reason, p) => {
    log.error("Unhandled rejection at Promise ", p, " with reason ", reason);
});
