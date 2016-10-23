import Plugin from "./../Plugin";
import Util from "./../Util";

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

    lastMessages = {};

    spamInterval = 1000;
    oldThreshold = 60; // Reject messages older than this many seconds

    proxy(eventName, message) {
        const now = (new Date()).getTime();
        const author = message.from.id;
        const lastMessage = this.lastMessages[author];

        // Skip old messages when "catching up"
        if ((Math.round(now / 1000) - message.date) > this.oldThreshold)
            return Promise.reject();

        // The difference is in milliseconds.
        if (lastMessage && ((now - lastMessage) < this.spamInterval)) {
            this.log.verbose("Rejecting message from " + Util.buildPrettyUserName(message.from));
            return Promise.reject();
        }

        this.lastMessages[author] = now;
        return Promise.resolve();
    }
}