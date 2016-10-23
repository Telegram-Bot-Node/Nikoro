import Plugin from "./../Plugin";

export default class Logger extends Plugin {
    static get plugin() {
        return {
            name: "Logger",
            description: "Log stuff",
            help: "",

            visibility: Plugin.Visibility.HIDDEN,
            type: Plugin.Type.PROXY,

            needs: {
                database: true
            }
        };
    }

    proxy(eventName, message) {
        if (message.from.username) {
            if (!this.db["chat" + message.chat.id])
                this.db["chat" + message.chat.id] = {};
            this.db["chat" + message.chat.id][message.from.username] = message.from.id;
        }

        // Register people who join or leave, too.
        if (message.new_chat_participant || message.left_chat_participant) {
            const source = message.new_chat_participant ?
                message.new_chat_participant :
                message.left_chat_participant;
            if (!this.db["chat" + message.chat.id])
                this.db["chat" + message.chat.id] = {};
            this.db["chat" + message.chat.id][source.username] = source.id;
        }
        return Promise.resolve();
    }
}