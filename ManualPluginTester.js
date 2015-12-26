var config = require('./Config');

var PluginManager = require('./src/PluginManager');
var plugins = new PluginManager();

var TelegramBot = require('node-telegram-bot-api');


console.log("The tester is starting...");
var self = this;

plugins.runPlugins(config.activePlugins, function(){
    console.log("All plugins are now running!");
    
    var events = ["text","audio","document","photo","sticker","video","voice","contact","location","new_chat_participant","left_chat_participant","new_chat_title","new_chat_photo","delete_chat_photo","group_chat_created"];
    events.forEach(function(eventName){
        process.on(eventName, function(message){
            emitHandleReply(eventName, message);
        });
    });
});

function emitHandleReply(eventName, message){

    try{
        plugins.emit(eventName, message, function(reply) {
            console.log(reply);
            console.log();
        });
    } catch (ex){
        console.log(ex);
    }
    
};

// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);
process.on('beforeExit', shutDown);


function shutDown() {
    console.log("The bot is shutting down, stopping plugins");
    plugins.shutDown().then(function(){
        console.log("All plugins stopped correctly!")
        process.exit();
    });
}



var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then substring() 
    var text = d.toString().trim()
    message = { text:text, 
            chat:{ id:-1 }};
    process.emit("text", message);
});