/*
 By default the needed API keys are looked for in the envinroment variables set before/while running the bot.
 You can easly set them in setup.sh and run 'source setup.sh' before running the bot
*/
var Config = {};

// TELEGRAM HTTP API TOKEN
Config.TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
Config.MONGO_URL = "mongodb://localhost:27017/Telegram-Bot-node"

// filename without extension of the active plugins
Config.activePlugins = ["Ping"];

// optional api keys
Config.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // google.js and youtube.js
Config.CSE_ID = process.env.CSE_ID; // googleimage
Config.CSE_API_KEY = process.env.CSE_API_KEY; // googleimage

// logging options
Config.loggingLevel = "debug"; // error, warn, info, verbose, debug(it should not be used in production, too much spam)

module.exports = Config;
