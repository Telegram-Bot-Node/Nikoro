import TelegramBot from "node-telegram-bot-api";
import Log from "./Log";
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));
import PluginManager from "./PluginManager";
import Auth from "./helpers/Auth";
import assert from "assert";

const log = Log.get("Bot");

log.info("The bot is starting...");

assert(typeof Config.TELEGRAM_TOKEN === typeof "", "You must provide a Telegram bot token in Config.js.");
assert(Config.TELEGRAM_TOKEN !== "", "Please provide a valid Telegram bot token.");
log.verbose(`Creating a TelegramBot instance...`);
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, {polling: true});
log.verbose("Created.");

let pluginManager = {
    stopPlugins: () => Promise.resolve()
};

log.verbose("Getting data about myself...");
bot.getMe()
.then(initBot)
.catch(die);

function initBot(/* getMe */) {
    log.info("Gotten.");
    log.info("Loading plugins...");

    pluginManager = new PluginManager(bot);

    // Loads and prepares root and base plugins
    pluginManager.loadPlugins(Config.activePlugins);
    log.info("Plugins loaded.");
    log.info("Configuring permissions...");
    Auth.init();
    log.info("Configured.");
    log.info("The bot is online!");
}

/*
function logReplyTo(msg){
  var text = "Reply to chat " + msg.chat.id;
  if(! (msg.type == "private")){
    text += " '" + msg.chat.title + "'";
  }
  text += " from " + ( "@" + (msg.from.username || "nousername")) + " " + (msg.from.first_name || "")+ " " + (msg.from.last_name || "");
  log.verbose(text);
}
*/

// If `CTRL+C` is pressed we stop the bot safely.
process.on("SIGINT", handleShutdown);

// Stop safely in case of `uncaughtException`.
// process.on("uncaughtException", shutDown);

function handleShutdown() {
    log.info("The bot is shutting down, stopping safely all the plugins...");
    pluginManager.stopPlugins().then(function() {
        log.info("All plugins stopped correctly.");
        process.exit();
    });
}

function die(err) {
    log.error(err);
    process.exit(-1);
}

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});