var config = {};

config.telegramToken = process.env.TELEGRAM_TOKEN;

config.activePlugins = ["ping", "tts", "set", "yp"];

module.exports = config;