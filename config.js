var config = {};

config.telegramToken = process.env.TELEGRAM_TOKEN;

config.activePlugins = ["ping", "tts", "set", "yp", "google", "twitter"];

module.exports = config;