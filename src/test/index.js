/* eslint-env node, es6, mocha */
const PluginManager = require("../PluginManager");
const config = JSON.parse(require("fs").readFileSync(__dirname + "/sample-config.json", "utf8"));
const Auth = require("../helpers/Auth");
let auth = new Auth(config);

const EventEmitter = require("events");
class TelegramBot extends EventEmitter {
    constructor() {
        super();
        this.i = 0;
        this.date = Math.floor(new Date() / 1000);
    }

    pushMessage(message, type = "text") {
        if (!message.id)
            message.message_id = this.i++;
        if (!message.from)
            message.from = {
                id: 12345678,
                first_name: 'Foobar',
                username: 'foo_bar'
            };
        if (!message.chat)
            message.chat = {
                id: -123456789,
                title: 'Test group',
                type: 'group',
                all_members_are_administrators: false
            };
        if (!message.date)
            message.date = this.date++;
        const cmdRegex = /\/[\w_]+/i;
        if (cmdRegex.test(message.text))
            message.entities = [{
                type: "bot_command",
                offset: 0,
                length: message.text.match(cmdRegex)[0].length
            }];
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

describe("Bot", function() {
    let bot;
    let pluginManager;
    it("should start correctly with the Ping plugin", function() {
        bot = new TelegramBot();
        pluginManager = new PluginManager(bot, config);
        pluginManager.loadPlugins(["Ping"]); // [] = Active plugins
    });
    it("should reply to /help", function(done) {
        bot.pushMessage({text: "/help"}, "text");
        bot.once("_debug_message", function() {
            done();
        });
    });
    it("should reply to /help Ping", function(done) {
        bot.pushMessage({text: "/help Ping"}, "text");
        bot.once("_debug_message", function() {
            done();
        });
    });
    it("should support multiline inputs", function(done) {
        pluginManager.loadPlugins(["Echo"]);
        const string = "foo\nbar";
        bot.once("_debug_message", function({text}) {
            if (text !== string) {
                done(new Error(`Expected ${JSON.stringify(string)}, got ${JSON.stringify(text)}`));
                return;
            }
            done();
        });
        bot.pushMessage({text: `/echo ${string}`}, "text");
    });
});

describe("Ignore", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config);
    pluginManager.loadPlugins(["auth", "Ping"]);
    it("should ignore", function(done) {
        auth.addAdmin(1, -123456789);
        bot.pushMessage({
            text: "/ignore 123",
            from: {
                id: 1,
                first_name: 'Root',
                username: 'root'
            }
        }, "text");

        const callback = ({text}) => done(new Error("The bot replied to a ping"));
        bot.on("_debug_message", callback);
        setTimeout(function() {
            bot.removeListener("_debug_message", callback);
            done();
        }, 100);
    });
});

describe("Ping", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config);
    pluginManager.loadPlugins(["Ping"]);
    it("should reply to /ping", function(done) {
        bot.pushMessage({text: "ping"}, "text");
        bot.once("_debug_message", function() {
            done();
        });
    });
});

describe("RateLimiter", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config);
    pluginManager.loadPlugins(["Ping"]);
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