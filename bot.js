var config = require('./config');

var pluginsL = config.activePlugins;
var token = config.telegramToken;

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});

console.log("The bot is starting...");
console.log(pluginsL.length + " plugins enabled");

/*loading the plugins*/
var pluginsM = [];
for(i=0;i<pluginsL.length;i++){
    var plugin = require("./plugins/" + pluginsL[i])
    pluginsM.push(new plugin());
}
console.log("Plugins loaded");

/*init method*/
for(i=0;i<pluginsM.length;i++){
    pluginsM[i].init();
}
console.log("Plugins initialized");


bot.on('message', function (msg) {

    if(msg.text){ //right now we handle only commands coming as text messages
        var chatId = msg.chat.id;

        for(pl=0;pl<pluginsM.length;pl++)
        {
            pluginsM[pl].doMessage(msg, function(reply){ //this does the job, I don't know if it is the best way, but is good for async functions done by plugins 
                if(reply.type == "text")
                {
                    bot.sendMessage(chatId, reply.text);
                }

                if(reply.type == "audio")
                {
                    bot.sendAudio(chatId, reply.audio);
                }

                if(reply.type == "photo")
                {
                    bot.sendPhoto(chatId, reply.photo);
                }

                if(reply.type == "status")
                {
                    bot.sendChatAction(chatId, reply.status);
                }
                return;
            });
        }
    }

});

process.on('SIGINT', shutDown);
process.on('uncaughtException', shutDown);  //remove this is you are developing plugins

function shutDown(){
    console.log("The bot is shutting down...");
    for(i=0;i<pluginsM.length;i++){
        pluginsM[i].doStop();
    }
    /*need a better way to implement this: 
        wait until all plugins have stopped before exiting, something with callbacks (which I don't know much about)
    waiting 1,5 sec is NOT good, but works*/

    setTimeout(function() {
        process.exit();  
    }, 1500);
}

