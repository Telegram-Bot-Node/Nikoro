// Author: Cristian Achille
// Date: 25-10-2016

const Plugin = require("./../Plugin");

module.exports = class Echo extends Plugin {

    static get plugin() {
        return {
            name: "Echo",
            description: "Totally not a bot with an echo",
            help: "`/echo Lorem Ipsum`"
        };
    }

    onCommand({message, command, args}) {
        if (command !== "echo") return;
        if (!args[0]) return;

        this.log.debug("(((Echoing)))");
        this.sendMessage(message.chat.id, args.join(" "));
    }
};