import Plugin from "./../Plugin";

export default class Ping extends Plugin {

    static get plugin() {
        return {
            name: "Ping",
            description: "Ping - Pong",
            help: "Send `ping`, get `pong`\nIf only life was _this_ easy.",
            needs: {
                database: 1
            }
        };
    }

    onText(message, reply) {
        if (!this.db.text) this.db.text = "Pong!";
        if (message.text !== "ping") return;
        this.log.debug("Got a ping");
        reply({type: 'text', text: this.db.text});
        this.synchronize();
    }
}