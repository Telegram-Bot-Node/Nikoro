var config = require('./config');
var token = config.telegramToken;
var PluginManager = require('./plugins');
var plugins = new PluginManager();

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {
    polling: true
});

console.log("The bot is starting...");
plugins.runPlugins(config.activePlugins);

bot.on('message', function(msg) {
    if (msg.text) {
        var chatId = msg.chat.id;

        plugins.doMessage(msg, function(reply) {
            switch (reply.type) {
                case "text":
                    bot.sendMessage(chatId, reply.text);
                    break;
                case "audio":
                    bot.sendAudio(chatId, reply.audio);
                    break;
                case "photo":
                    bot.sendPhoto(chatId, reply.photo);
                    break;
                case "status":
                    bot.sendChatAction(chatId, reply.status);
                    break;
                case "sticker":
                    bot.sendSticker(chatId, reply.sticker);
                    break;
                default:
                    console.log("Error: Unrecognized response");
            }
        });
    }
});

// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);

// Stop safely in case of `uncaughtException`.
process.on('uncaughtException', shutDown);

function shutDown() {
    console.log("The bot is shutting down...");
    plugins.shutDown(function() {
        process.exit();
    });
}
