const TelegramBot = require("node-telegram-bot-api");
const Log = require("./Log");
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));
const PluginManager = require("./PluginManager");
const Auth = require("./helpers/Auth");
const auth = new Auth(Config);
const assert = require("assert");

const log = Log.get("Bot", Config);

assert(typeof Config.TELEGRAM_TOKEN === typeof "", "You must provide a Telegram bot token in Config.js.");
assert(Config.TELEGRAM_TOKEN !== "", "Please provide a valid Telegram bot token.");

log.verbose(`Creating a TelegramBot instance...`);
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, {polling: true});
log.info("Instance created.");

log.verbose("Loading plugins...");
const pluginManager = new PluginManager(bot, Config, auth);
pluginManager.loadPlugins(Config.activePlugins);
log.info("Plugins loaded.");

log.verbose("Configuring permissions...");
log.info("Permissions configured.");
log.info("The bot is online!");

// If `CTRL+C` is pressed we stop the bot safely.
process.on("SIGINT", handleShutdown("SIGINT received"));

// Stop safely in case of `uncaughtException`.
process.on("uncaughtException", handleShutdown("Uncaught exception"));

function handleShutdown(reason) {
    return (err) => {
    	                                                                                                                        if (err) log.error(err);
        log.warn("Shutting down, reason: " + reason);
        log.info("Stopping safely all the plugins...");
        pluginManager.stopPlugins().then(function() {
            log.info("All plugins stopped correctly.");
            process.exit();
        });
    };
}

process.on('unhandledRejection', (reason, p) => {
    log.error("Unhandled rejection at Promise ", p, " with reason ", reason);
});