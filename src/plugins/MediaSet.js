const Plugin = require("./../Plugin");
const Util = require("./../Util");

module.exports = class MediaSet extends Plugin {

    constructor(...args) {
        super(...args);

        if (!this.db.triggers) {
            this.db.triggers = {};
        }

        if (!this.db.pendingRequests) {
            this.db.pendingRequests = {};
        }
    }

    static get plugin() {
        return {
            name: "MediaSet",
            description: "Media-capable set command",
            help: '/mset `trigger`'
        };
    }

    onText({message}) {
        const text = message.text;

        if (!this.db.triggers[message.chat.id]) return;
        const triggers = this.db.triggers[message.chat.id];

        for (const trigger in triggers) {
            if (text.indexOf(trigger) === -1) continue;
            const re = new RegExp("(?:\\b|^)(" + Util.escapeRegExp(trigger) + ")(?:\\b|$)", "g");
            const match = re.exec(text);
            if (!match) continue;
            const media = triggers[trigger];

            this.log.verbose("Match on " + Util.buildPrettyChatName(message.chat));
            switch (media.type) {
            case "audio":
                return this.sendAudio(message.chat.id, media.fileId);
            case "document":
                return this.sendDocument(message.chat.id, media.fileId);
            case "photo":
                return this.sendPhoto(message.chat.id, media.fileId);
            case "sticker":
                return this.sendSticker(message.chat.id, media.fileId);
            case "video":
                return this.sendVideo(message.chat.id, media.fileId);
            case "voice":
                return this.sendVoice(message.chat.id, media.fileId);
            default:
                throw new Error("Unrecognized type");
            }
        }
    }

    onAudio({message}) {
        this.setStepTwo(message, "audio");
    }
    onDocument({message}) {
        this.setStepTwo(message, "document");
    }
    onPhoto({message}) {
        this.setStepTwo(message, "photo");
    }
    onSticker({message}) {
        this.setStepTwo(message, "sticker");
    }
    onVideo({message}) {
        this.setStepTwo(message, "video");
    }
    onVoice({message}) {
        this.setStepTwo(message, "voice");
    }

    onCommand({message, command, args}) {
        if (command !== "mset") return;
        if (args.length !== 1)
            return this.sendMessage(
                message.chat.id,
                "Syntax: /mset `trigger`",
                {
                    parse_mode: "Markdown"
                }
            );

        this.log.verbose("Triggered stepOne on " + Util.buildPrettyChatName(message.chat));

        if (!this.db.pendingRequests[message.chat.id])
            this.db.pendingRequests[message.chat.id] = {};

        this.sendMessage(message.chat.id, "Perfect! Now send me the media as a reply to this message!")
        .then(({message_id}) => {
            this.db.pendingRequests[message.chat.id][message_id] = args[0];
        });
    }

    setStepTwo(message, mediaType) {
        // is this a reply for a "now send media" message?
        if (!message.hasOwnProperty('reply_to_message')) return;
        // are there pending requests for this chat?
        if (!this.db.pendingRequests[message.chat.id]) return;

        // This is because keys are stored as strings, but message.message_id is a number.
        const messageId = String(message.reply_to_message.message_id);

        // foreach request (identified by the "now send media" message id)
        for (const request in this.db.pendingRequests[message.chat.id]) {
            // if the message is not replying just continue
            if (messageId !== request) continue;

            const trigger = this.db.pendingRequests[message.chat.id][request];

            // do we have triggers for this chat?
            if (!this.db.triggers[message.chat.id])
                this.db.triggers[message.chat.id] = {};

            // build the trigger
            let fileId;
            if (mediaType === "photo")
                fileId = message.photo[0].file_id;
            else
                fileId = message[mediaType].file_id;

            this.log.verbose("Added trigger on " + Util.buildPrettyChatName(message.chat));
            // set the trigger
            this.db.triggers[message.chat.id][trigger] = {
                type: mediaType,
                fileId: fileId
            };

            // delete pending request
            delete this.db.pendingRequests[message.chat.id][request];

            this.synchronize();

            this.sendMessage(message.chat.id, "Done! Enjoy!");
            return;
        }
    }
};