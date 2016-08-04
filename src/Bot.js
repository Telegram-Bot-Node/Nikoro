import TelegramBot from "node-telegram-bot-api";
import Log from "./Log";
import Config from "./../Config";
import PluginManager from "./PluginManager";
import Auth from "./helpers/Auth";

const log = Log.get("Bot");

log.info("The bot is starting...");

log.verbose(`Creating instance of TelegramBot
            with token '${Config.TELEGRAM_TOKEN}'...`);
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, {polling: true});
log.verbose("Created.");

let pluginManager = null;

log.verbose("Getting data about myself...");
bot.getMe()
.then(initBot)
.catch(die);

function initBot(/* getMe */) {
    log.info("Gotten.");
    log.info("Loading plugins...");

    pluginManager = new PluginManager(bot);

    // Loads and prepares root and base plugins
    pluginManager.loadPlugins(Config.activePlugins)
    .catch(err => {
        log.warn("Some plugins couldn't be loaded.");
        die(err);
    })
    .then(() => {
        log.info("Plugins loaded.");
        log.info("Starting the plugins...");
        // Starts every plugin
        return pluginManager.startPlugins();
    })
    .then(() => {
        log.info("Plugins started.");
        log.info("Configuring permissions...");
        Auth.init();
        log.info("Configured.");
        log.info("The bot is online!");
    })
    .catch(err => log.error(err));
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