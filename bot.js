var config = require('./config');

var pluginsL = config.activePlugins;
var token = config.telegramToken;

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});

console.log("The bot is starting...");
console.log(pluginsL.length + " plugins enabled");

var pluginsM = [];
for(i=0;i<pluginsL.length;i++){
    var plugin = require("./plugins/" + pluginsL[i])
    pluginsM.push(new plugin());
}

console.log("Plugins loaded");

for(i=0;i<pluginsM.length;i++){
        pluginsM[i].init();
    }

console.log("Plugins initialized");


bot.on('message', function (msg) {

    if(msg.text){
        
        var chatId = msg.chat.id;
        for(i=0;i<pluginsM.length;i++){
            pluginsM[i].doMessage(msg, function(reply){
                if(reply.type == "text")
                {
                    bot.sendMessage(chatId, reply.text);
                }

                if(reply.type == "audio")
                {
                    bot.sendAudio(chatId, reply.audio)
                }
            });
        }
    }

});


function shutDown(){
    console.log("The bot is shutting down...");
    for(i=0;i<pluginsM.length;i++){
        pluginsM[i].doStop();
    }
    setTimeout(function() {
        process.exit();  
    }, 1500);
}

process.on('SIGINT', shutDown);
process.on('uncaughtException', shutDown);