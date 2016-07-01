import Plugin from "./../Plugin";


export default class Ping extends Plugin {

    plugin = {
        name: "Plugin",
        description: "Ping - Pong",
        help: "Send `ping`, get `pong`\nIf only life was _this_ easy.",
    };

    init() {
        var logger = this.log;
        this.interface.on("text", function({message, callback: reply}) {
            if (message.text == "ping"){
                logger.info("Got a `ping`");
                reply({type: 'text', text: 'pong'});
            }
        });
    }
};

