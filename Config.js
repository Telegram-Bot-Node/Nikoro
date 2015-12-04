var config = {};

config.telegramToken = process.env.TELEGRAM_TOKEN;

config.activePlugins = ["ping", "8ball", "imgur", "karma", "quote", "roll", "set", "google", "youtube", "reddit"];

module.exports = config;