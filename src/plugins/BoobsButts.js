import Plugin from "../Plugin";
import request from "request";

export default class BoobsButts extends Plugin {
    static get plugin() {
        return {
            name: "BoobsButts",
            description: "Get boobs and butts.",
            help: "Just type /boobs or /butts."
        };
    }

    onCommand({message, command, args}, reply) {
        switch (command) {
        case "boobs":
        case "butts":
            request(`http://api.o${command}.ru/noise/1`, (err, _, data) => {
                if (err)
                    return reply({
                        type: "text",
                        text: "An error occurred."
                    });

                const item = JSON.parse(data)[0];
                reply({
                    type: "text",
                    text: `http://media.o${command}.ru/${item.preview}`
                });
            });
            return;
        default:
            return;
        }
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

            if (response.statusCode === 404 || response.headers["content-length"] === "503")
                return Imgur.findValidPic(s + 1, reply);

            reply({
                type: 'text',
                text: `https://i.imgur.com/${url}.png`
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
}
