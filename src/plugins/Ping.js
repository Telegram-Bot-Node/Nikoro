const Plugin = require("./../Plugin");

module.exports = class Ping extends Plugin {

    static get plugin() {
        return {
            name: "Ping",
            description: "Ping - Pong",
            help: "Send `ping`, get `pong`\nIf only life was _this_ easy."
        };
    }

    get commands() { return {
        ping: () => "Pong!"
    }; }

    onText({message}, reply) {
        if (message.text !== "ping") return;
        this.log.debug("Got a ping");
        reply({type: 'text', text: "Pong!"});
    }
};