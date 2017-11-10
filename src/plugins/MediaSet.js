const Plugin = require("./../Plugin");
const Util = require("./../Util");

module.exports = class MediaSet extends Plugin {
    constructor(obj) {
        super(obj);

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
            help: "/mset `trigger`, /munset `trigger`"
        };
    }

    onText({message}) {
        if (!this.db.triggers[message.chat.id]) return;

        const text = message.text;
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
                this.sendAudio(message.chat.id, media.fileId);
                break;
            case "document":
                this.sendDocument(message.chat.id, media.fileId);
                break;
            case "photo":
                this.sendPhoto(message.chat.id, media.fileId);
                break;
            case "sticker":
                this.sendSticker(message.chat.id, media.fileId);
                break;
            case "video":
                this.sendVideo(message.chat.id, media.fileId);
                break;
            case "video_note":
                this.sendVideoNote(message.chat.id, media.fileId);
                break;
            case "voice":
                this.sendVoice(message.chat.id, media.fileId);
                break;
            default:
                this.log.error(`Unrecognized media type: ${media.type}`);
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
    onVideoNote({message}) {
        this.setStepTwo(message, "video_note");
    }
    onVoice({message}) {
        this.setStepTwo(message, "voice");
    }

    onCommand({message, command, args}) {
        const chatID = message.chat.id;
        const trigger = args[0];
        switch (command) {
        case "mset":
            if (args.length !== 1)
                return this.sendMessage(chatID, "Syntax: `/mset trigger`", {parse_mode: "Markdown"});
            this.log.verbose("Triggered stepOne on " + Util.buildPrettyChatName(message.chat));
            if (!this.db.pendingRequests[chatID])
                this.db.pendingRequests[chatID] = {};
            this.sendMessage(chatID, "Perfect! Now send me the media as a reply to this message!")
                .then(({message_id}) => {
                    this.db.pendingRequests[chatID][message_id] = trigger;
                });
            break;
        case "munset":
        case "moonset":
            if (args.length !== 1)
                return this.sendMessage(chatID, "Syntax: `/munset trigger` (or `/moonset trigger`)", {parse_mode: "Markdown"});
            delete this.db.triggers[chatID][trigger];
            this.log.verbose("Removed trigger " + trigger + " on " + Util.buildPrettyChatName(message.chat));
            this.sendMessage(chatID, "Done!");
            break;
        }
    }

    setStepTwo(message, mediaType) {
        // is this a reply for a "now send media" message?
        if (!message.hasOwnProperty("reply_to_message")) return;
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

            this.sendMessage(message.chat.id, "Done! Enjoy!");
            return;
        }
    }
};