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

    onCommand({message, command, args}, reply) {
        if (command !== "imgur") return;
        Imgur.findValidPic(0, reply);
    }

    static findValidPic(s, reply) {
        if (s > 50)
            return;

        reply({type: "status", status: "upload_photo"});

        const url = Imgur.generateUrl(6);
        const options = {
            method: 'HEAD',
            uri: `http://i.imgur.com/${url}.png`
        };

        request(options, (error, response) => {
            if (error)
                return reply({
                    type: "text",
                    text: "An error occurred."
                });

            if (response.statusCode === 404 || response.headers["content-length"] === "503")
                return Imgur.findValidPic(s + 1, reply);

            reply({
                type: 'photo',
                photo: `https://i.imgur.com/${url}.png`
            });
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
