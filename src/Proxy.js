/*
 * This is called on every message.
 * It can reject a message, or transform it, or let it through.
 */
import Util from "./Util";
import Logger from "./Logger";
import Rebridge from "rebridge";

var db = Rebridge();

export default class MessageProxy {
    lastMessage = {}
    spamInterval = 1000

    constructor() {
        this.log = Logger.get("Proxy");
    }

    sniff(message, eventName) {
        this.log.info(JSON.stringify(message));
        if (message.from.username) {
            if (!db["chat" + message.chat.id])
                db["chat" + message.chat.id] = {};
            db["chat" + message.chat.id]["ID_" + message.from.username] = message.from.id;
        }
        // Register people who join or leave, too.
        if (message.new_chat_participant || message.left_chat_participant) {
            const source = message.new_chat_participant ?
                message.new_chat_participant :
                message.left_chat_participant;
            if (!db["chat" + message.chat.id])
                db["chat" + message.chat.id] = {};
            db["chat" + message.chat.id]["ID_" + source.username] = source.id;
        }
        // Types that represent "actual" data and not events
        const messageTypes = ["text", "audio", "document", "photo", "sticker", "video", "voice", "contact", "location"];
        // Let events through
        if (messageTypes.indexOf(eventName) === -1) return Promise.resolve(message);

        if (db.ignored && db.ignored.indexOf(message.from.id) !== -1) return Promise.reject();

        const now = (new Date()).getTime();
        const author = message.from.id;
        const lastMessage = this.lastMessage[author];

        // The difference is in milliseconds.
        if (lastMessage && ((now - lastMessage) < this.spamInterval)) {
            this.log.info("Rejecting message from " + Util.buildPrettyUserName(message.from));
            return Promise.reject();
        }
        this.lastMessage[author] = now;

        return Promise.resolve(message);
    }
}