const Plugin = require("../Plugin");
const request = require("request-promise-native");

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
        return this.findValidPic(0, message);
    }

    async findValidPic(s, message) {
        if (s > 50)
            return;

        this.sendChatAction(message.chat.id, "upload_photo");

        const url = `http://i.imgur.com/${Imgur.generateUrl(6)}.png`;

        try {
            const response = await request({
                method: "HEAD",
                uri: url
            });
            if (response["content-length"] === "12022")
                return this.findValidPic(s + 1, message);
            return {
                type: "photo",
                photo: url
            };
        } catch (e) {
            if (e.statusCode === 404)
                return this.findValidPic(s + 1, message);
            return "An error occurred.";
        }
    }

    static generateUrl(len) {
        let url = "";
        const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
        for (let i = 0; i < len; i++)
            url += letters[Math.floor(Math.random() * letters.length)];
        return url;
    }
};
