const Plugin = require("../Plugin");
const request = require("request");

module.exports = class Imgur extends Plugin {
    static get plugin() {
        return {
            name: "Imgur",
            description: "Get a random image from imgur",
            help: "`/imgur` will get you a random image from imgur, the popular image hosting website.\nBeware, you could randomly find adult content."
        };
    }

    onCommand({message, command}) {
        if (command !== "imgur") return;
        Imgur.findValidPic(0, message);
    }

    static findValidPic(s, message) {
        if (s > 50)
            return;

        this.sendChatAction(message.chat.id, "upload_photo");

        const url = Imgur.generateUrl(6);
        const options = {
            method: "HEAD",
            uri: `http://i.imgur.com/${url}.png`
        };

        request(options, (error, response) => {
            if (error)
                return this.sendMessage(message.chat.id, "An error occurred.");

            if (response.statusCode === 404 || response.headers["content-length"] === "503")
                return Imgur.findValidPic(s + 1, message);

            this.sendPhoto(message.chat.id, `https://i.imgur.com/${url}.png`);
        });
    }

    static generateUrl(len) {
        let url = "";
        const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
        for (let i = 0; i < len; i++)
            url += letters[Math.floor(Math.random() * letters.length)];
        return url;
    }
};
