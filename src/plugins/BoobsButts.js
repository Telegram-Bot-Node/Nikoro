const Plugin = require("../Plugin");
const request = require("request-promise-native");

module.exports = class BoobsButts extends Plugin {
    static get plugin() {
        return {
            name: "BoobsButts",
            description: "Get boobs and butts.",
            help: "Just type /boobs or /butts."
        };
    }

    async onCommand({command}) {
        switch (command) {
            case "boobs":
            case "butts": {
                const data = await request(`http://api.o${command}.ru/noise/1`);
                const item = JSON.parse(data)[0];
                return {
                    type: "photo",
                    photo: `http://media.o${command}.ru/${item.preview}`
                };
            }
        }
    }
};
