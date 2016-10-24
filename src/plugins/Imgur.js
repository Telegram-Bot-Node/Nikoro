import Plugin from "../Plugin";
import request from "request";

export default class Imgur extends Plugin {
    static get plugin() {
        return {
            name: "Imgur",
            description: "Get a random image from imgur",
            help: "`/imgur` will get you a random image from imgur, the popular image hosting website.\nBeware, you could randomly find adult content.",
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "imgur") return;
        Imgur.findValidPic(0, reply);
    }

    static findValidPic(s, reply) {
        if (s > 50)
            return;

        reply({type:"status", status: "upload_photo"});

        const url = Imgur.generateUrl(6);
        const options = {
            method: 'HEAD',
            uri: `http://i.imgur.com/${url}.png`
        };
        console.log(`Trying ${options.uri}`);
        const req = request(options, (error, response) => {
            if (error)
                return reply({
                    type: "text",
                    text: "An error occurred."
                });
            console.log(response.statusCode);
            if (response.statusCode === 404 || response.headers["content-length"] === "503")
                return Imgur.findValidPic(s + 1, reply);
            else {
                console.log(response.headers);
                reply({
                    type: 'text',
                    text: `https://i.imgur.com/${url}.png`
                });
            }
        });
        req.on("error", e => console.log(e));
    };

    static generateUrl(len) {
        let url = "";
        const letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
        for (let i = 0; i < len; i++)
            url += letters[Math.floor(Math.random()*letters.length)];
        return url;
    }
}
