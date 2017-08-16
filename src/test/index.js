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
        pluginManager = new PluginManager(bot, config, auth);
        pluginManager.loadPlugins(["Ping"]); // [] = Active plugins
    });
    it("should reply to /help", function(done) {
        bot.pushMessage({text: "/help"});
        bot.once("_debug_message", function() {
            done();
        });
    });
    it("should reply to /help Ping", function(done) {
        bot.pushMessage({text: "/help Ping"});
        bot.once("_debug_message", function() {
            done();
        });
    });
    it("should enable plugins", function(done) {
        const sentinel = Math.random().toString();
        bot.on("_debug_message", function({text}) {
            if (text.includes(sentinel)) done();
        });
        bot.pushMessage({
            text: "/enableplugin echo",
            from: {
                id: 1,
                first_name: 'Root',
                username: 'root'
            }
        });
        bot.pushMessage({text: `/echo ${sentinel}`});
    });
    it("should disable plugins", function(done) {
        this.slow(200);
        const sentinel = Math.random().toString();
        const callback = ({text}) => {
            if (text.includes(sentinel)) done(new Error("Echo wasn't disabled"));
        }
        bot.on("_debug_message", callback);
        setTimeout(function() {
            bot.removeListener("_debug_message", callback);
            done();
        }, 100);

        bot.pushMessage({
            text: "/disableplugin echo",
            from: {
                id: 1,
                first_name: 'Root',
                username: 'root'
            }
        });
        bot.pushMessage({text: `/echo ${sentinel}`});
    });
    it("shouldn't let unauthorized users enable plugins", function(done) {
        this.slow(200);
        const sentinel = Math.random().toString();
        const callback = ({text}) => {
            if (text.includes(sentinel)) done(new Error("Echo was enabled"));
        };
        bot.on("_debug_message", callback);
        setTimeout(function() {
            bot.removeListener("_debug_message", callback);
            done();
        }, 100);

        bot.pushMessage({
            text: "/enableplugin echo",
            from: {
                id: 1000,
                first_name: 'Evil Eve',
                username: 'eve'
            }
        });
        bot.pushMessage({text: `/echo ${sentinel}`});
    });
    it("shouldn't let unauthorized users disable plugins", function(done) {
        this.slow(200);
        pluginManager.loadPlugins(["Echo"]);
        const sentinel = Math.random().toString();
        const callback = ({text}) => {
            if (text.includes(sentinel)) done();
        };
        bot.on("_debug_message", callback);

        bot.pushMessage({
            text: "/disableplugin echo",
            from: {
                id: 1000,
                first_name: 'Evil Eve',
                username: 'eve'
            }
        });
        bot.pushMessage({text: `/echo ${sentinel}`});
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
        bot.pushMessage({text: `/echo ${string}`});
    });
});

describe("Ignore", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config, auth);
    pluginManager.loadPlugins(["auth", "Ping"]);
    it("should ignore", function(done) {
        this.slow(200);
        auth.addAdmin(1, -123456789);
        const callback = ({text}) => done(new Error("The bot replied to a ping"));
        bot.on("_debug_message", callback);
        setTimeout(function() {
            bot.removeListener("_debug_message", callback);
            done();
        }, 100);

        bot.pushMessage({
            text: "/ignore 123",
            from: {
                id: 1,
                first_name: 'Root',
                username: 'root'
            }
        });
    });
});

describe("Ping", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config, auth);
    pluginManager.loadPlugins(["Ping"]);
    it("should reply to /ping", function(done) {
        bot.once("_debug_message", () => done());
        bot.pushMessage({text: "ping"});
    });
});

describe("RateLimiter", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config, auth);
    pluginManager.loadPlugins(["Ping"]);
    it("should reject spam", function(done) {
        this.timeout(6000);
        this.slow(6000);
        const limit = 50;
        let replies = 0;

        pluginManager.loadPlugins(["RateLimiter"]);

        const callback = () => replies++;
        bot.on("_debug_message", callback);

        for (let i = 0; i < limit; i++)
            bot.pushMessage({text: "ping"});

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