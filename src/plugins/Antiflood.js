const Plugin = require("./../Plugin");
const Util = require("./../Util");
const LeakyBucket = require("leaky-bucket");

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
        return ignoreLimiter.throttle().catch(() => {
            this.log.verbose("Rejecting message from " + Util.buildPrettyUserName(message.from));
            // Re-reject, so the rejection bubbles up
            return Promise.reject();
        });
    }

    processWarn(message) {
        const warnLimiter = this.warnLimiters[message.chat.id];
        if (!warnLimiter) return;
        warnLimiter.throttle().catch(() => {
            const warnMessageLimiter = this.warnMessageLimiters[message.chat.id];
            // Do not help the user spam: apply another limiter to our messages.
            return warnMessageLimiter.throttle();
        }).catch(() => {
            const username = Util.buildPrettyUserName(message.from);
            this.log.verbose(`Warning ${username} for flooding`);
            this.sendMessage(message.chat.id, `User ${username} is flooding!`);
        });
    }

    processKick(message) {
        const kickLimiter = this.kickLimiters[message.chat.id];
        if (!kickLimiter) return;
        kickLimiter.throttle().catch(() => {
            const username = Util.buildPrettyUserName(message.from);
            this.log.verbose(`Kicking ${username} for flooding`);
            this.sendMessage(message.chat.id, `Kicking ${username} for flooding.`);
            return this.kickChatMember(message.chat.id, message.from.id);
        }).catch(err => this.sendMessage(message.chat.id, "An error occurred while kicking the user: " + err));
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

    onCommand({message, command, args}) {
        switch (command) {
            case "floodignore": {
                if (args.length !== 1)
                    return "Syntax: /floodignore <N>";
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                const chatId = message.chat.id;
                const N = Number(args[0]);
                if (N === 0) {
                    delete this.ignoreLimiters[chatId];
                    return "Antiflood ignore disabled for this chat.";
                }
                this.ignoreLimiters[chatId] = new LeakyBucket(N, RATE_TIMEOUT, 0);
                return `New rate limit: ${N} messages per 5 seconds`;
            }
            case "floodwarn": {
                if (args.length !== 1)
                    return "Syntax: /floodwarn <N>";
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                const chatId = message.chat.id;
                const N = Number(args[0]);
                if (N === 0) {
                    delete this.warnLimiters[chatId];
                    return "Antiflood warn disabled for this chat.";
                }
                this.warnLimiters[chatId] = new LeakyBucket(N, RATE_TIMEOUT, 0);
                // Issue at most one warning every five seconds, so as not to help the user spam
                this.warnMessageLimiters[chatId] = new LeakyBucket(1, RATE_TIMEOUT, 0);
                return `New rate limit: ${N} messages per 5 seconds`;
            }
            case "floodkick": {
                if (args.length !== 1)
                    return "Syntax: /floodkick <N>";
                if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
                    return "Insufficient privileges (chat admin required).";
                const chatId = message.chat.id;
                const N = Number(args[0]);
                if (N === 0) {
                    delete this.kickLimiters[chatId];
                    return "Antiflood kick disabled for this chat.";
                }
                this.kickLimiters[chatId] = new LeakyBucket(N, RATE_TIMEOUT, 0);
                return `New rate limit: ${N} messages per 5 seconds`;
            }
        }
    }
};