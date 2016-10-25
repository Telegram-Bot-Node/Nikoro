import TelegramBot from "node-telegram-bot-api";
import Log from "./Log";
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));
import PluginManager from "./PluginManager";
import Auth from "./helpers/Auth";
import assert from "assert";

const log = Log.get("Bot");

assert(typeof Config.TELEGRAM_TOKEN === typeof "", "You must provide a Telegram bot token in Config.js.");
assert(Config.TELEGRAM_TOKEN !== "", "Please provide a valid Telegram bot token.");

log.verbose(`Creating a TelegramBot instance...`);
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, {polling: true});
log.info("Instance created.");

log.verbose("Loading plugins...");
const pluginManager = new PluginManager(bot);
pluginManager.loadPlugins(Config.activePlugins);
log.info("Plugins loaded.");

log.verbose("Configuring permissions...");
Auth.init();
log.info("Permissions configured.");
log.info("The bot is online!");

// If `CTRL+C` is pressed we stop the bot safely.
process.on("SIGINT", handleShutdown);

// Stop safely in case of `uncaughtException`.
process.on("uncaughtException", handleShutdown);

function handleShutdown() {
    log.info("The bot is shutting down, stopping safely all the plugins...");
    pluginManager.stopPlugins().then(function() {
        log.info("All plugins stopped correctly.");
        process.exit();
    });
}

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});