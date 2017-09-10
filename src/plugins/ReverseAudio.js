const Plugin        = require("../Plugin");
const Util          = require("../Util");
const fs            = require('fs');
const child_process = require("child_process");
const ffmpeg        = require('ffmpeg-static').path;
let config;

module.exports = class ReverseAudio extends Plugin {
    static get plugin() {
        return {
            name: "ReverseAudio",
            description: "Reverses audio! :D",
            help: "Reply to an audio with /reverseaudio",
            needs: { }
        }
    }

    start(config) {
        this.config = config;
    }

    onCommand({message, command, args}, reply) {
        if (command !== "reverseaudio" && command !== "reverse") return;
        if (!message.hasOwnProperty('reply_to_message')) return reply({
            type: "text",
            text: "You need to reply to an audio with this command."
        });
        console.log("it's reverseaudio!");
        let target;
        let isVoice = false;
        if (message.reply_to_message.hasOwnProperty("voice")) {
            target = message.reply_to_message.voice.file_id;
            isVoice = true;
        } else if (message.reply_to_message.hasOwnProperty("audio")) {
            target = message.reply_to_message.audio.file_id;
        } else {
            reply({
                type: "text",
                text: "Welp, I want an audio/voice message, anything else won't work :c"
            })
            return;
        }

        console.log("target: ");
        console.log(target);

        this.bot.getFile(target).then((file) => {
            const token = JSON.parse(require("fs").readFileSync("./config.json", "utf8")).TELEGRAM_TOKEN;
            console.log(this.bot.config)
            const fileurl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
            Util.downloadAndSaveTempResource(fileurl, "ogg", (filepath) => {
                const fn = `/tmp/${Util.makeUUID()}.ogg`;
                child_process.spawnSync(ffmpeg, ["-i", filepath, "-af", "areverse", fn]);
                reply({
                    type: "audio",
                    audio: fn
                })
            })
                /* fs.readFile(filepath, 'utf8', (err, data) => {
                    if (err) return console.log(err);
                    audiofile = data;
                    console.log(data);
                }) */
        })
    }
}