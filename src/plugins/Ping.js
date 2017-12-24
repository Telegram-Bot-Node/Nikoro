const Plugin = require("./../Plugin");

module.exports = class Ping extends Plugin {
    static get plugin() {
        return {
            name: "Ping",
            description: "Ping - Pong",
            help: "Send `ping`, get `pong`\nIf only life was _this_ easy."
        };
    }

    onCommand({command}) {
        if (command !== "ping") return;
        this.log.debug("Got a ping");
        return "Pong!";
    }

    onText({message}) {
        if (message.text !== "ping") return;
        this.log.debug("Got a ping");
        return "Pong!";
    }
};