const Plugin = require("./../Plugin");
const Util = require("./../Util");

// Codice nuovo
const spamInterval = 1000; // todo: move to config
const oldThreshold = 60; // todo: move to config

module.exports = class RateLimiter extends Plugin {
    static get plugin() {
        return {
            name: "RateLimiter",
            description: "Automatically ignore spamming users",
            help: "",

            visibility: Plugin.Visibility.HIDDEN,
            type: Plugin.Type.PROXY
        };
    }

    start() {
        this.lastMessages = {};
    }

    proxy(eventName, message) {
        // Ignore inline messages
        if (!message.chat) return Promise.resolve();

        const now = (new Date()).getTime();
        const author = message.from.id;
        const lastMessage = this.lastMessages[author];

        // Skip old messages when "catching up"
        if ((Math.round(now / 1000) - message.date) > oldThreshold)
            return Promise.reject();

        // The difference is in milliseconds.
        if (lastMessage && ((now - lastMessage) < spamInterval)) {
            this.log.verbose("Rejecting message from " + Util.buildPrettyUserName(message.from));
            return Promise.reject();
        }

        this.lastMessages[author] = now;
        return Promise.resolve();
    }
};