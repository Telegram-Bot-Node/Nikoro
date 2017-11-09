const EventEmitter = require("events");

module.exports = class TelegramBot extends EventEmitter {
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

    pushRootMessage(message, type = "text") {
        message.from = {
            id: 1,
            first_name: 'Root',
            username: 'root'
        };
        this.pushMessage(message, type);
    }

    pushEvilMessage(message, type = "text") {
        message.from = {
            id: 1000,
            first_name: 'Evil Eve',
            username: 'eve'
        };
        this.pushMessage(message, type);
    }

    sendMessage(chatId, text, options) {
        this.emit("_debug_message", {
            chatId,
            text,
            options
        });
    }
};