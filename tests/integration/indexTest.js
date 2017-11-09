/* eslint-env node, es6, mocha */
const PluginManager = require("../../src/PluginManager");
const Auth = require("../../src/helpers/Auth");
const TelegramBot = require('./helpers/TelegramBot');
const config = require("./sample-config.json");
const auth = new Auth(config);

// Enables us to get around the "done called multiple times" without much repetition.
const fixDone = done => {
    let wasDoneCalled = false;
    return (...args) => {
        if (wasDoneCalled) return;
        wasDoneCalled = true;
        done(...args);
    };
};

let i = 0;
function makeSentinel() {
    return `Sentinel<${i++}>`;
}

function expectsAnyMessage(bot) {
    return new Promise(resolve => bot.on("_debug_message", resolve));
}

function expectsMessage(bot, target) {
    // Todo: cleanup listener
    return new Promise(resolve => bot.on("_debug_message", ({text}) => {
        if (text === target) resolve();
    }));
}

function notExpectsMessage(bot, target, errorText = "Should not have received message", delay = 500) {
    // Todo: cleanup listener
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, delay);
        bot.on("_debug_message", ({text}) => {
            if (text !== target)
                return;
            clearTimeout(timeout);
            reject(new Error(errorText));
        });
    })
}

describe("Bot", function() {
    let bot;
    let pluginManager;
    it("should start correctly with the Ping plugin", function() {
        bot = new TelegramBot();
        pluginManager = new PluginManager(bot, config, auth);
        pluginManager.loadPlugins(["Ping"]); // [] = Active plugins
    });
    it("should reply to /help", function() {
        const p = expectsAnyMessage(bot);
        bot.pushMessage({text: "/help"});
        return p;
    });
    it("should reply to /help Ping", function() {
        const p = expectsAnyMessage(bot);
        bot.pushMessage({text: "/help Ping"});
        return p;
    });
    it("should enable plugins", function() {
        const sentinel = makeSentinel();
        const p = expectsMessage(bot, sentinel);
        bot.pushRootMessage({text: "/enable Echo"});
        bot.pushMessage({text: `/echo ${sentinel}`});
        return p;
    });
    it("should disable plugins", function() {
        this.slow(1100);
        const sentinel = makeSentinel();
        const p = notExpectsMessage(bot, sentinel, "Echo wasn't disabled");

        bot.pushRootMessage({text: "/disable Echo"});
        bot.pushMessage({text: `/echo ${sentinel}`});
        return p;
    });
    it("shouldn't let unauthorized users enable plugins", function() {
        this.slow(200);
        const sentinel = makeSentinel();
        const p = notExpectsMessage(bot, sentinel, "Echo was enabled");

        bot.pushEvilMessage({text: "/enable Echo"});
        bot.pushMessage({text: `/echo ${sentinel}`});
        return p;
    });
    it("shouldn't let unauthorized users disable plugins", function() {
        pluginManager.loadPlugins(["Echo"]);
        const sentinel = makeSentinel();
        const p = expectsMessage(bot, sentinel);

        bot.pushEvilMessage({text: "/disable Echo"});
        bot.pushMessage({text: `/echo ${sentinel}`});
        return p;
    });
    it("should support multiline inputs", function() {
        pluginManager.loadPlugins(["Echo"]);
        const string = makeSentinel() + "\n" + makeSentinel();
        const p = expectsMessage(bot, string);
        bot.pushMessage({text: `/echo ${string}`});
        return p;
    });
});

describe("Ignore", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config, auth);
    pluginManager.loadPlugins(["Echo", "Ignore"]);
    it("should ignore", function() {
        const sentinel = makeSentinel();
        const p = notExpectsMessage(bot, sentinel, "The bot replied to an echo");

        bot.pushRootMessage({text: "/ignore 123"});
        // Give Ignore some time to react
        setTimeout(() => bot.pushMessage({
            text: `/echo ${sentinel}`,
            from: {
                id: 123,
                first_name: 'Foo Bar',
                username: 'foobar'
            }
        }), 50);
        return p;
    });
});

describe("Ping", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config, auth);
    pluginManager.loadPlugins(["Ping"]);
    it("should reply to /ping", function() {
        const p = expectsAnyMessage(bot);
        bot.pushMessage({text: "ping"});
        return p;
    });
});

describe("Antiflood", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot, config, auth);
    pluginManager.loadPlugins(["Antiflood", "Echo"]);
    it("should reject spam", async function() {
        this.timeout(4000);
        this.slow(3000);
        const sentinel = makeSentinel();
        const spamAmount = 50, spamLimit = 5;
        let replies = 0;

        const callback = ({text}) => {
            if (text === sentinel)
                replies++;
        };
        bot.on("_debug_message", callback);

        bot.pushRootMessage({text: `/floodignore ${spamLimit}`});

        // Leave the plugin some time to set up the thing
        await (new Promise(resolve => setTimeout(() => resolve(), 100)));

        for (let i = 0; i < spamAmount; i++)
            bot.pushMessage({text: `/echo ${sentinel}`});

        return new Promise((resolve, reject) => setTimeout(function() {
            // bot.removeListener("_debug_message", callback);
            if (replies === spamLimit)
                resolve();
            else
                reject(new Error(`The bot replied ${replies} times.`));
        }, 50 * spamAmount)); // The bot shouldn't take longer than 50 ms avg per message
    });
});

describe("Scheduler", function() {
    it("should initialize correctly", function() {
        require("../../src/helpers/Scheduler");
    });
    it.skip("should schedule events", function(done) {
        this.slow(1500);
        const scheduler = require("../../src/helpers/Scheduler");
        const sentinel = Math.random().toString();
        const delay = 1000;
        const start = new Date();
        scheduler.on(sentinel, () => {
            const end = new Date();
            // Margin of error: +/- 100 ms
            if ((start - end) > (delay + 100))
                done(new Error(`Takes too long: ${start - end} ms`));
            else if ((start - end) < (delay - 100))
                done(new Error(`Takes too little: ${start - end} ms`));
            else
                done();
        });
        scheduler.schedule(sentinel, {}, new Date(start + delay));
    });
    it.skip("should cancel events", function(done) {
        this.slow(1500);
        const scheduler = require("../../src/helpers/Scheduler");
        const sentinel = Math.random().toString();
        const doneTimeout = setTimeout(() => done(), 1000);
        sentinel.on(sentinel, () => {
            clearTimeout(doneTimeout);
            done(new Error("Event was not cancelled"));
        }, {}, new Date(new Date() + 500));
        const errorEvent = scheduler.schedule(sentinel, {});
        scheduler.cancel(errorEvent);
    });
    it.skip("should look up events by metadata", function(done) {
        this.slow(1500);
        const scheduler = require("../../src/helpers/Scheduler");
        const sentinel = Math.random().toString();
        let isFinished = false;
        const doneTimeout = setTimeout(() => done(), 1000);
        scheduler.on(sentinel, () => {
            if (isFinished)
                return; // Prevents "done called twice" errors
            clearTimeout(doneTimeout);
            done(new Error("Event was not cancelled"));
        });
        scheduler.schedule(sentinel, {
            name: "My test event",
            color: "red"
        }, new Date(new Date() + 500));
        const errorEvent = scheduler.search(event => event.name === "My test event" && event.color === "red");
        if (!errorEvent) {
            isFinished = true;
            clearTimeout(doneTimeout);
            done(new Error("Event not found"));
            return;
        }
        scheduler.cancel(errorEvent);
    });
});