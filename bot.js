var config = require('./config');
var token = config.telegramToken;

var PluginManager = require('./plugins');
var plugins = new PluginManager();

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});

console.log("The bot is starting...");
plugins.runPlugins(config.plugins);

bot.on('message', function(msg) {
    if (msg.text) {
        var chatId = msg.chat.id;

        plugins.doMessage(msg, function(reply) {
            switch(reply.type) {
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
                default:
                    console.log("Error: Unrecognized response");
            }
        });
    }
});

//if CTRL+C is pressed we stop the bot safely.
process.on('SIGINT', shutDown);
//stop safely in case of uncaughtException
process.on('uncaughtException', shutDown);  

function shutDown(){
    console.log("The bot is shutting down...");
    for(i=0;i<runningPlugins.length;i++){
        runningPlugins[i].doStop();
    }
    /*need a better way to implement this: 
        wait until all plugins have stopped before exiting, something with callbacks (which I don't know much about)
    waiting 1,5 sec is NOT good, but works*/

    setTimeout(function() {
        process.exit();  
    }, 1500);
}

