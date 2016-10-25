/* eslint-env node, es6, mocha */
import Auth from "../helpers/Auth";
import PluginManager from "../PluginManager";

import EventEmitter from "events";
class TelegramBot extends EventEmitter {
    i = 0;
    date = Math.floor(new Date() / 1000);
/*    constructor() {
        super();
        setInterval(() => {
            this.emit("text", {
                message_id: this.i++,
                from: {
                    id: 12345678,
                    first_name: 'Foobar',
                    username: 'foo_bar'
                },
                chat: {
                    id: -123456789,
                    title: 'Test group',
                    type: 'group',
                    all_members_are_administrators: false
                },
                date: this.date++,
                text: '/help'
            });
        }, 10);
    }
*/
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

describe("Bot", function() {
    let bot;
    let pluginManager;
    it("should start correctly with the Ping plugin", function() {
        bot = new TelegramBot();
        pluginManager = new PluginManager(bot);
        pluginManager.loadPlugins(["Ping"]); // [] = Active plugins
        Auth.init();
    });
    it("should reply to pings", function(done) {
        bot.pushMessage({text: "ping"}, "text");
        bot.once("_debug_message", function() {
            done();
        });
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
});