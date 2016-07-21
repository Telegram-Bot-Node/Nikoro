import Plugin from "./../Plugin";
import Logger from "../Logger";
import Util from "./../Util";

var lastMessages = {};
const spamInterval = 1000;

export default class RateLimiter extends Plugin {
    get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <username>",
            isProxy: true
        };
    }

	proxy(eventName, message) {
        const now = (new Date()).getTime();
        const author = message.from.id;
        const lastMessage = lastMessages[author];

        // The difference is in milliseconds.
        if (lastMessage && ((now - lastMessage) < spamInterval)) {
            this.log.info("Rejecting message from " + Util.buildPrettyUserName(message.from));
            return Promise.reject();
        }
        lastMessages[author] = now;
        return Promise.resolve(message);
	}
}