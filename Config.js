var config = {};

config.telegramToken = process.env.TELEGRAM_TOKEN;

config.activePlugins = ["ping"];

config.loggingLevel = "info"; 

module.exports = config;
