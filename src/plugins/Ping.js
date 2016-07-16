import Plugin from "./../Plugin";

export default class Ping extends Plugin {
    plugin = {
        name: "Ping",
        description: "Ping - Pong",
        help: "Send `ping`, get `pong`\nIf only life was _this_ easy."
    };

    onText(message, reply) {
        if (message.text !== "ping") return;
        this.log.info("Got a ping");
        reply({type: 'text', text: 'pong'});
    }
}