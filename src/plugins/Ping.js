const Plugin = require("./../Plugin");

module.exports = class Ping extends Plugin {

    static get plugin() {
        return {
            name: "Ping",
            description: "Ping - Pong",
            help: "Send `ping`, get `pong`\nIf only life was _this_ easy."
        };
    }

    onText({message}) {
        if (!this.db.text) this.db.text = "Pong!";
        if (message.text !== "ping") return;
        this.log.debug("Got a ping");
        this.sendMessage(message.chat.id, this.db.text);
    }
};