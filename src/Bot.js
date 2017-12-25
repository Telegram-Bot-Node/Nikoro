/* eslint no-console: 0 no-sync: 0 */

// Automatic cancellation in node-telegram-bot-api is deprecated, disable it
process.env.NTBA_FIX_319 = 1;

const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const Logger = require("./Log");
const Config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const PluginManager = require("./PluginManager");
const Auth = require("./helpers/Auth");
const auth = new Auth(Config);

if (typeof Config.TELEGRAM_TOKEN !== "string" || Config.TELEGRAM_TOKEN === "") {
    console.log("You must provide a Telegram bot token in config.json. Try running \"npm run configure:guided\" or \"npm run configure:expert\".");
    process.exit(1);
}

const log = new Logger("Bot", Config);

// Version reporting, useful for bug reports
let commit = "";
if (fs.existsSync(path.join(__dirname, "../.git")))
    commit = fs.readFileSync(path.join(__dirname, "../.git/refs/heads/es6"), "utf8").substr(0, 7);
log.info(`Nikoro version ${require("../package.json").version}` + (commit ? `, commit ${commit}` : ""));

if (Config.globalAdmins) {
    log.warn("Config contains deprecated key 'globalAdmins', replacing with 'owners'");
    Config.owners = Config.globalAdmins;
    delete Config.globalAdmins;
    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4));
}

log.verbose("Creating a TelegramBot instance...");
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, {polling: true});
log.info("Instance created.");

log.verbose("Loading plugins...");
const pluginManager = new PluginManager(bot, Config, auth);
pluginManager.loadPlugins(Config.activePlugins, false);
pluginManager.startSynchronization();
log.info("Plugins loaded.");

log.info("The bot is online!");

function handleShutdown(reason) {
    return err => {
        if (err && (err != "SIGINT")) log.error(err);
        log.warn("Shutting down, reason: " + reason);
        log.info("Stopping safely all the plugins...");
        pluginManager.stopSynchronization();
        pluginManager.stopPlugins().then(function() {
            log.info("All plugins stopped correctly.");
            process.exit();
        });
    };
}

// If `CTRL+C` is pressed we stop the bot safely.
process.on("SIGINT", handleShutdown("Terminated by user"));

// Stop safely in case of `uncaughtException`.
process.on("uncaughtException", handleShutdown("Uncaught exception"));

process.on("unhandledRejection", (reason, p) => {
    log.error("Unhandled rejection at Promise ", p, " with reason ", reason);
});