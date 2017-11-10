const Plugin = require("./../Plugin");

module.exports = class Ping extends Plugin {
    static get plugin() {
        return {
            name: "Ping",
            description: "Ping - Pong",
            help: "Send `ping`, get `pong`\nIf only life was _this_ easy."
        };
    }

    get commands() {
        return {
            ping: () => "Pong pong!"
        };
    }

    onText({message}) {
        if (message.text !== "ping") return;
        this.log.debug("Got a ping");
        this.sendMessage(message.chat.id, "Pong!");
    }
};