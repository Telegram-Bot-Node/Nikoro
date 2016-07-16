/*
 * This is called on every message.
 * It can reject a message, or transform it, or let it through.
 */
import Util from "./Util";
import Logger from "./Logger";

export default class MessageProxy {
    lastMessage = {}
    spamInterval = 1000

    constructor() {
        this.log = Logger.get("Proxy");
    }

    sniff(message, eventName) {
        // Types that represent "actual" data and not events
        const messageTypes = ["text", "audio", "document", "photo", "sticker", "video", "voice", "contact", "location"];
        // Let events through
        if (messageTypes.indexOf(eventName) === -1) return Promise.resolve(message);

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