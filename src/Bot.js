import TelegramBot from "node-telegram-bot-api";
import {MongoClient} from 'mongodb';
import Logger from "./Logger";

import Config from "./../Config";

import PluginManager from "./PluginManager";

import MessageProxy from "./Proxy";

const log = Logger.get("Bot");

log.info("The bot is starting...");

log.verbose(`Creating instance of TelegramBot
            with token '${Config.TELEGRAM_TOKEN}'...`);
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, { polling: true });
log.verbose("Created.");

let pluginManager = null;

getMe()
.then(connectToDb)
.then(saveMeToDb)
.then(initBot)
.catch(die);


function initBot() {
    log.info("Loading plugins...");

    var lastMessage = {};

    pluginManager = new PluginManager();
    pluginManager.loadPlugins(Config.activePlugins)
    .then(() => {
        log.info("Plugins loaded.");
        log.info("Starting the plugins...");
    })
    .then(() => pluginManager.startPlugins())
    .then(() => {
        log.info("Plugins started.");
    })
    .then(() => {
        log.info("Setting up events...");
        const messageProxy = new MessageProxy();
        const events = ["text","audio","document","photo","sticker","video","voice","contact","location","new_chat_participant","left_chat_participant","new_chat_title","new_chat_photo","delete_chat_photo","group_chat_created"];
        for (const eventName of events) {
            bot.on(eventName, message => messageProxy.sniff(message, eventName).then(function(message) {
                const chatID = message.chat.id;
                log.debug(`Triggered event: ${eventName}`);
                pluginManager.emit(eventName, message, reply => handleReply(chatID, reply));
            }))
        }
        log.info("Events set.");
    })
    .then(() => {
        log.info("The bot is online!");
    })
    .catch(err => log.error(err))
}

/*
* TODO: port to es6
*/
function handleReply(chatId, reply){

  switch (reply.type) {
    case "text":
        return bot.sendMessage(chatId, reply.text, reply.options);

    case "audio":
        return bot.sendAudio(chatId, reply.audio, reply.options);
    case "document":
        return bot.sendDocument(chatId, reply.document, reply.options);
    case "photo":
        return bot.sendPhoto(chatId, reply.photo, reply.options);
    case "sticker":
        return bot.sendSticker(chatId, reply.sticker, reply.options);
    case "video":
        return bot.sendVideo(chatId, reply.video, reply.options);
    case "voice":
        return bot.sendVoice(chatId, reply.voice, reply.options);

    case "status": case "chatAction":
        return bot.sendChatAction(chatId, reply.status, reply.options);

    default:
        log.warn(`Unrecognized reply type ${reply.type}`);
  }
}

/*function logReplyTo(msg){
  var text = "Reply to chat " + msg.chat.id;
  if(! (msg.type == "private")){
    text += " '" + msg.chat.title + "'";
  }
  text += " from " + ( "@" + (msg.from.username || "nousername")) + " " + (msg.from.first_name || "")+ " " + (msg.from.last_name || "");
  log.verbose(text);
}*/

// If `CTRL+C` is pressed we stop the bot safely.
process.on("SIGINT", handleShutdown);

// Stop safely in case of `uncaughtException`.
//process.on("uncaughtException", shutDown);

function handleShutdown() {
    log.info("The bot is shutting down, stopping safely all the plugins...");
    pluginManager.stopPlugins().then(function(){
        log.info("All plugins stopped correctly.");
        process.exit();
    });
}

function die(err) {
    log.error(err);
    process.exit(-1);
}

function getMe(params = {}) {
    log.verbose("Calling TelegramBot.getMe()...");

    return bot.getMe()
        .then(me => {
            log.verbose("TelegramBot.getMe() successful.");
            params.me = me;
            return params;
        })
}

function connectToDb(settings) {
    log.verbose("Connecting to Mongo...")
    return MongoClient.connect(Config.MONGO_URL)
        .then(db => {
            log.verbose("Connected.");
            settings.db = db;
            return settings;
        })
}

function saveMeToDb(settings) {
    log.verbose("Writing getMe() result to database...");

    let botCollection = settings.db.collection('bot');

    return botCollection.updateOne({}, settings.me, {upsert: true})
        .then(() => {
            log.verbose("Written.");
            return settings;
        })
}
