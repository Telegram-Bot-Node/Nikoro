var config = require('./Config');
var token = config.telegramToken;

var PluginManager = require('./PluginManager');
var plugins = new PluginManager();

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {
    polling: true
});

console.log("The bot is starting...");
plugins.runPlugins(config.activePlugins, function(){
    console.log("All plugins are now running!");
    
    var events = ["text","audio","document","photo","sticker","video","voice","contact","location","new_chat_participant","left_chat_participant","new_chat_title","new_chat_photo","delete_chat_photo","group_chat_created"];
    events.forEach(function(eventName){
        bot.on(eventName, function(message){
            emitHandleReply(eventName, message);
        });
    });
});

function emitHandleReply(eventName, message){
    var chatId = message.chat.id; 
    plugins.emit(eventName, message, function(reply) { //have to do this to avoid problems with chatId. Not the cleanest way.
        handleReply(chatId,reply);
    });
};

function handleReply(chatId, reply){
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
        case "status": case "chatAction":
            bot.sendChatAction(chatId, reply.status);
            break;
        case "sticker":
            bot.sendSticker(chatId, reply.sticker);
            break;
        default:
            console.log("Error: Unrecognized reply type");
    }
}
// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);

// Stop safely in case of `uncaughtException`.
process.on('uncaughtException', shutDown);

function shutDown() {
    console.log("The bot is shutting down, stopping plugins");
    plugins.shutDown().then(function(){
        console.log("All plugins stopped correctly!")
        process.exit();
    });
}
