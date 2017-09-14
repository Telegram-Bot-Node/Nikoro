const Plugin = require("../Plugin");
const request = require("request");

module.exports = class BoobsButts extends Plugin {
    static get plugin() {
        return {
            name: "BoobsButts",
            description: "Get boobs and butts.",
            help: "Just type /boobs or /butts."
        };
    }

    onCommand({message, command}) {
        switch (command) {
        case "boobs":
        case "butts":
            request(`http://api.o${command}.ru/noise/1`, (err, _, data) => {
                if (err)
                    return this.sendMessage(message.chat.id, "An error occurred.");

                const item = JSON.parse(data)[0];
                this.sendPhoto(message.chat.id, `http://media.o${command}.ru/${item.preview}`);
            });
            return;
        default:
            return;
        }
    }
};
