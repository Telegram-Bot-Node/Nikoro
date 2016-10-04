import Plugin from "./../Plugin";
import Util from "./../Util";

var lastMessages = {};
const spamInterval = 1000;
const old_threshold = 60; // Reject messages older than this many seconds

export default class RateLimiter extends Plugin {
    static get plugin() {
        return {
            name: "RateLimiter",
            description: "Automatically ignore spamming users",
            help: "",

            visibility: Plugin.Visibility.HIDDEN,
            type: Plugin.Type.PROXY
        };
    }
    proxy(eventName, message) {
        const now = (new Date()).getTime();
        const author = message.from.id;
        const lastMessage = lastMessages[author];

        if ((Math.round(now / 1000) - message.date) > old_threshold)
            return Promise.reject();

        // The difference is in milliseconds.
        if (lastMessage && ((now - lastMessage) < spamInterval)) {
            this.log.info("Rejecting message from " + Util.buildPrettyUserName(message.from));
            return Promise.reject();
        }
        lastMessages[author] = now;
        return Promise.resolve(message);
    }
}