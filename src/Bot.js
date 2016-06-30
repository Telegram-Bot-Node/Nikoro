import TelegramBot from "node-telegram-bot-api";
import {MongoClient} from 'mongodb';
import Logger from "./Logger";

import Config from "./../Config";

import PluginManager from "./PluginManager";

var log = Logger.get("Bot");

log.info("The bot is starting...");

log.verbose(`Creating instance of TelegramBot
            with token '${Config.TELEGRAM_TOKEN}'`);
const bot = new TelegramBot(Config.TELEGRAM_TOKEN, { polling: true });
log.verbose("TelegramBot succesfully created");

let pluginManager = null;

getMe()
.then( ([me]) => {
    return connectToDb(Config.MONGO_URL, me);
})
.then(result => {
    return saveMeToDb(...result); //db, me
})
.then(result => {
    initBot(...result); //db, me
})
.catch(die);


function initBot() {

    pluginManager = new PluginManager();

    log.info("Loading the plugins");
    pluginManager.loadPlugins(Config.activePlugins)
    .then(() => {
        log.info("Plugins loaded");
        log.info("Starting the plugins");
    })
    .then(pluginManager.startPlugins())
    .then(() => {
        log.info("Plugins started");
    })
    .then(() => {
        return new Promise(
            (resolve, reject) => {
                log.info("Setting up events");
                const events = ["text","audio","document","photo","sticker","video","voice","contact","location","new_chat_participant","left_chat_participant","new_chat_title","new_chat_photo","delete_chat_photo","group_chat_created"];
                for (const eventName of events) {
                    bot.on(eventName, (message) => {
                        const _message = message;
                        log.debug("Triggered event: " + eventName);
                        pluginManager.emit(eventName, message, (reply) => {
                            handleReply(_message.chat.id, reply);
                        });
                    })
                }
                resolve();
            }
        );
    })
    .then(() => {
        log.info("The bot is online!");
    })
}

/*
* TODO: port to es6
*/
function handleReply(chatId, reply){

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
        log.warn("Unrecognized reply type: " + reply.type);
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
  log.info("The bot is shutting down, stopping safely all the plugins");
  pluginManager.stopPlugins().then(function(){
    log.info("All plugins stopped correctly");
    process.exit();
  });
}

function die(err) {
  log.error(err);
  process.exit(-1);
}

function getMe(...params) {
    return new Promise(
        (resolve, reject) => {
            log.verbose("Calling TelegramBot.getMe()");

            bot.getMe()
            .then(me => {
              log.verbose("TelegramBot.getMe() succesful");
              resolve([me, ...params]);
            }, error => reject(error));
        }
    );
}

function connectToDb(url, ...other) {
    return new Promise(
        (resolve, reject) => {
            MongoClient.connect(url)
              .then(db => {
                log.verbose("Connected to Mongo database");
                resolve([db, ...other]);
            }, error => reject(error));
        }
    );
}

function saveMeToDb(db, me, ...other) {
    return new Promise(
        (resolve, reject) => {
            log.verbose("Writing getMe() result to Database");

            let botCollection = db.collection('bot');
            botCollection.updateOne({}, me, {upsert: true})
            .then(db => {
              log.verbose("Write succesful");
              resolve([db, me, ...other]);
            }, error => reject(error));
        }
    );
}