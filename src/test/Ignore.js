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

describe("Ignore", function() {
    const bot = new TelegramBot();
    const pluginManager = new PluginManager(bot);
    pluginManager.loadPlugins(["Auth", "Ping"]);
    Auth.init();
    it("should ignore", function(done) {
        Auth.addAdmin(1, -123456789);
        bot.pushMessage({
            text: "/ignore 123",
            from: {
                id: 1,
                first_name: 'Root',
                username: 'root'
            }
        }, "text");

        const callback = function({text}) {
            if (text === "Pong!") return;
            done(new Error("The bot replied to a ping"));
        };
        bot.on("_debug_message", callback);
        setTimeout(function() {
            bot.removeListener("_debug_message", callback);
            done();
        }, 100);
    });
});