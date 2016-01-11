var winston = require('winston');

var TelegramBot = require('node-telegram-bot-api');
var config = require('./Config');
var token = config.telegramToken;

var PluginManager = require('./src/PluginManager');

require('./src/Loggers')('info'); //init loggers 

log = winston.loggers.get('bot');

log.verbose("Creating instance of TelegramBot with token " + token);
var bot = new TelegramBot(token, {
    polling: true
});
log.verbose("TelegramBot created");

var plugins = new PluginManager();


log.info("The bot is starting");

log.verbose("Calling getMe");
bot.getMe().then(function (me) {
    log.verbose("getMe successful: " + me.toString());

    log.info("Running the plugins");
    plugins.runPlugins(config.activePlugins, me, function(){
        log.info("The bot is online!");

        var events = ["text","audio","document","photo","sticker","video","voice","contact","location","new_chat_participant","left_chat_participant","new_chat_title","new_chat_photo","delete_chat_photo","group_chat_created"];
        events.forEach(function(eventName){
            bot.on(eventName, function(message){
                log.debug("Triggered event: " + eventName);
                if(!process.argv[2]) //pass a parameter to the node Bot.js command if you want to just listen to events and don't reply, useful if the bot crashed and it now has a big backlog.
                    emitHandleReply(eventName, message);
            });
        });

        bot.on("inline_query", function(query){
            log.debug("Triggered event: inline_query");
            plugins.emit("inline_query", query, function(results, options) {
                log.debug("Inside callback for emit inline_query");
                handleAnswerInlineQuery(query.id, results, options);
            });
        });
    });

}, function(){
    log.critical("Can't getMe! Is the token set?");
});


function emitHandleReply(eventName, message){
    var chatId = message.chat.id; 
    log.debug("Emitting event to plugins: " + eventName);
    try{
        plugins.emit(eventName, message, function(reply) { //have to do this to avoid problems with chatId. Not the cleanest way.
            log.debug("Inside callback for emit");
            handleReply(chatId,reply);
        });
    } catch (ex){
        console.log(ex);
    }
    
};

function handleReply(chatId, reply){

    log.verbose("Produced a reply for " + chatId);

    switch (reply.type) {
        case "text":
            bot.sendMessage(chatId, reply.text, reply.options);
            break;
        case "audio":
            bot.sendAudio(chatId, reply.audio, reply.options);
            break;
        case "photo":
            bot.sendPhoto(chatId, reply.photo, reply.options);
            break;
        case "status": case "chatAction":
            bot.sendChatAction(chatId, reply.status, reply.options);
            break;
        case "sticker":
            bot.sendSticker(chatId, reply.sticker, reply.options);
            break;
        default:
            console.warn("Unrecognized reply type");
    }
}


function handleAnswerInlineQuery(queryId, results, options){
    log.verbose("Produced an inline answer for " + queryId);
    bot.answerInlineQuery(queryId, results, options);
}

// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);

// Stop safely in case of `uncaughtException`.
//process.on('uncaughtException', shutDown);

function shutDown() {
    log.info("The bot is shutting down, stopping safely all the plugins");
    plugins.shutDown().then(function(){
        log.info("All plugins stopped correctly")
        process.exit();
    });
}
