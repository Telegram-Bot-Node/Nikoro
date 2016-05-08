const config = require('./Config');
const token = config.telegramToken;

const PluginManager = require('./src/PluginManager');
const plugins = new PluginManager();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {
    polling: true
});


console.log("The bot is starting...");

bot.getMe().then(function (me) {
    plugins.runPlugins(config.activePlugins, me, function(){
        console.log("All plugins are now running!");

        const events = [
            "text",
            "audio",
            "document",
            "photo",
            "sticker",
            "video",
            "voice",
            "contact",
            "location",
            "new_chat_participant",
            "left_chat_participant",
            "new_chat_title",
            "new_chat_photo",
            "delete_chat_photo",
            "group_chat_created"
        ];

        events.forEach(eventName => {
            bot.on(eventName, message => {
                if(process.argv[2]) //pass a parameter to the node Bot.js command if you want to just listen to events and don't reply, useful if the bot crashed and it now has a big backlog.
                    console.log(eventName);
                else   
                    emitHandleReply(eventName, message);
            });
        });

        bot.on(
            "inline_query",
            query => plugins.emit(
                "inline_query",
                query,
                (results, options) => handleAnswerInlineQuery(query.id, results, options)
            )
        );

    });

}, () => console.log("Can't getMe! Is the token set?"));


function emitHandleReply(eventName, message){
    const chatId = message.chat.id; 
    try {
        //have to do this to avoid problems with chatId. Not the cleanest way.
        plugins.emit(eventName, message, reply => handleReply(chatId, reply));
    } catch (ex) {
        console.log(ex);
    }    
};

function handleReply(chatId, reply) {
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
        case "status":
        case "chatAction":
            bot.sendChatAction(chatId, reply.status, reply.options);
            break;
        case "sticker":
            bot.sendSticker(chatId, reply.sticker, reply.options);
            break;
        default:
            console.log("Error: Unrecognized reply type");
    }
}


const handleAnswerInlineQuery = bot.answerInlineQuery(chatId, results, options);

// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);

// Stop safely in case of `uncaughtException`.
//process.on('uncaughtException', shutDown);

function shutDown() {
    console.log("The bot is shutting down, stopping plugins.");
    plugins.shutDown().then(function(){
        console.log("All plugins stopped correctly!")
        process.exit();
    });
}
