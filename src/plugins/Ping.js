import Plugin from "./../Plugin";

export default class Ping extends Plugin {

    get plugin() {
        return {
            name: "Ping",
            description: "Ping - Pong",
            help: "Send `ping`, get `pong`\nIf only life was _this_ easy.",
            needs: {
                database: 1
            },
            defaults: {
                message: "Pong!"
            }
        };
    }

    onText(message, reply) {
        if (message.text !== "ping") return;
        this.log.debug("Got a ping");
        reply({type: 'text', text: this.config.message});
    }
}