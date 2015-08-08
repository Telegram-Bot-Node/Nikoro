var config = require('./config');

var pluginsL = config.activePlugins;
var token = config.telegramToken;

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});

console.log("The bot is starting...");
console.log(pluginsL.length + " plugins enabled.");

/*loading the plugins*/
var runningPlugins = [];
for(i=0;i<pluginsL.length;i++){
    var pluginModule = require("./plugins/" + pluginsL[i])
    plugin = new pluginModule();

    if (typeof plugin.check == 'function') { //optional function to check if required stuff is set
        if(plugin.check()){ //if everything is set
            runningPlugins.push(plugin);
        }
        else{
            console.log(pluginsL[i] + ".check() fails. Plugin not activated.");
        }
    }
    else {
        runningPlugins.push(plugin);
    }
}
console.log(runningPlugins.length + " plugins running.");

/*init method*/
for(i=0;i<runningPlugins.length;i++){
    runningPlugins[i].init();
}
console.log(runningPlugins.length + " Plugins initialized.");


bot.on('message', function (msg) {

    if(msg.text){ //right now we handle only commands coming as text messages
        var chatId = msg.chat.id;

        for(pl=0;pl<runningPlugins.length;pl++)
        {
            runningPlugins[pl].doMessage(msg, function(reply){ //this does the job, I don't know if it is the best way, but is good for async functions done by plugins 
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

