const Plugin = require("./../Plugin");
const Util = require("./../Util");
const RateLimiter = require("limiter").RateLimiter;

const RATE_TIMEOUT = 5000;

module.exports = class Antiflood extends Plugin {
    constructor(obj) {
        super(obj);

        this.auth = obj.auth;

        this.lastMessages = {};
        this.ignoreLimiters = {};
        this.warnLimiters = {};
        this.warnMessageLimiters = {};
        this.kickLimiters = {};
    }

    static get plugin() {
        return {
            name: "Antiflood",
            description: "Automatically ignore or kick spamming users",
            help: `Use /floodignore <N> if you want the bot to ignore spamming users (i.e. not respond to their commands) after N messages in 5 seconds.
Use /floodwarn <N> to warn the user after N messages every 5 seconds.
Use /floodkick <N> to kick users automatically after N messages every 5 seconds.

A value of 0 disables the feature (eg. "/floodkick 0" will disable automatic kicking).`,

            isProxy: true
        };
    }

    processIgnore(message) {
        // Approve messages if no ignoreLimiter is present
        const ignoreLimiter = this.ignoreLimiters[message.chat.id];
        if (!ignoreLimiter) return Promise.resolve();

        // Approve messages if the ignoreLimiter says it's fine
        if (ignoreLimiter.tryRemoveTokens(1)) return Promise.resolve();

        // If we got this far, the ignoreLimiter says the user is spamming.
        this.log.verbose("Rejecting message from " + Util.buildPrettyUserName(message.from));
        return Promise.reject();
    }

    processWarn(message) {
        const warnLimiter = this.warnLimiters[message.chat.id];
        if (!warnLimiter) return;
        if (warnLimiter.tryRemoveTokens(1)) return;
        const warnMessageLimiter = this.warnMessageLimiters[message.chat.id];
        // Do not help the user spam: apply another limiter to our messages.
        if (!warnMessageLimiter.tryRemoveTokens(1)) return;
        const username = Util.buildPrettyUserName(message.from);
        this.log.verbose(`Warning ${username} for flooding`);
        this.sendMessage(message.chat.id, `User ${username} is flooding!`);
    }

    processKick(message) {
        const kickLimiter = this.kickLimiters[message.chat.id];
        if (!kickLimiter) return;
        if (kickLimiter.tryRemoveTokens(1)) return;
        const username = Util.buildPrettyUserName(message.from);
        this.log.verbose(`Kicking ${username} for flooding`);
        this.sendMessage(message.chat.id, `Kicking ${username} for flooding.`);
        this.kickChatMember(message.chat.id, message.from.id)
            .catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
    }

    proxy(eventName, message) {
        // Don't even process inline messages
        if (!message.chat) return Promise.resolve();

        // Skip old messages when "catching up"
        const oldThreshold = 30; // todo: move to config
        const now = new Date().getTime();
        if ((Math.round(now / 1000) - message.date) > oldThreshold)
            return Promise.reject();

        this.processWarn(message);
        this.processKick(message);
        return this.processIgnore(message);
    }

    get commands() {
        return {
            floodignore: ({message, args}) => {
                if (args.length !== 1)
                    return "Syntax: /floodignore <N>";
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Mods only.";
                const chatId = message.chat.id;
                const N = Number(args[0]);
                if (N === 0) {
                    delete this.ignoreLimiters[chatId];
                    return "Antiflood ignore disabled for this chat.";
                }
                this.ignoreLimiters[chatId] = new RateLimiter(N, RATE_TIMEOUT);
                return `New rate limit: ${N} messages per 5 seconds`;
            },
            floodwarn: ({message, args}) => {
                if (args.length !== 1)
                    return "Syntax: /floodwarn <N>";
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Mods only.";
                const chatId = message.chat.id;
                const N = Number(args[0]);
                if (N === 0) {
                    delete this.warnLimiters[chatId];
                    return "Antiflood warn disabled for this chat.";
                }
                this.warnLimiters[chatId] = new RateLimiter(N, RATE_TIMEOUT);
                // Issue at most one warning every five seconds, so as not to help the user spam
                this.warnMessageLimiters[chatId] = new RateLimiter(1, RATE_TIMEOUT);
                return `New rate limit: ${N} messages per 5 seconds`;
            },
            floodkick: ({message, args}) => {
                if (args.length !== 1)
                    return "Syntax: /floodkick <N>";
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Mods only.";
                const chatId = message.chat.id;
                const N = Number(args[0]);
                if (N === 0) {
                    delete this.kickLimiters[chatId];
                    return "Antiflood kick disabled for this chat.";
                }
                this.kickLimiters[chatId] = new RateLimiter(N, RATE_TIMEOUT);
                return `New rate limit: ${N} messages per 5 seconds`;
            }
        };
    }
};