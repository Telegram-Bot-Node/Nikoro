/* eslint-env node, es6, mocha */
const Auth = require("../helpers/Auth");
const PluginManager = require("../PluginManager");

const EventEmitter = require("events");
class TelegramBot extends EventEmitter {
    constructor() {
        super();
        this.i = 0;
        this.date = Math.floor(new Date() / 1000);
    }

    pushMessage(message, type = "text") {
        message.message_id = this.i++;
        message.from = {
            id: 12345678,
            first_name: 'Foobar',
            username: 'foo_bar'
        };
        message.chat = {
            id: -123456789,
            title: 'Test group',
            type: 'group',
            all_members_are_administrators: false
        };
        message.date = this.date++;
        this.emit(type, message);
    }
    sendMessage(chatId, text, options) {
        this.emit("_debug_message", {
            chatId,
            text,
            options
        });
    }
}

describe("RateLimiter", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot);
    pluginManager.loadPlugins(["Ping"]);
    Auth.init();
    it("should reject spam", function(done) {
        this.timeout(6000);
        this.slow(6000);
        const limit = 50;
        let replies = 0;

        pluginManager.loadPlugins(["RateLimiter"]);

        const callback = function() {
            replies++;
        };
        bot.on("_debug_message", callback);

        for (let i = 0; i < limit; i++)
            bot.pushMessage({text: "ping"}, "text");

        setTimeout(function() {
            bot.removeListener("_debug_message", callback);
            pluginManager.removePlugin("RateLimiter");
            if (replies === 1)
                done();
            else
                done(new Error(`The bot replied ${replies} times.`));
        }, 2 * limit); // The bot shouldn't take longer than 2 ms avg per message
    });
});