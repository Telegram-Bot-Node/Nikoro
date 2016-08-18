import Plugin from "./../Plugin";
import Util from "./../Util";

export default class MediaSet extends Plugin {

    get plugin() {
        return {
            name: "MediaSet",
            description: "Media-capable set command",
            help: '/mset `trigger`',

            needs: {
                database: true
            }
        };
    }

    start() {
        if (!this.db.triggers)
            this.db.triggers = {};

        if (!this.db.pendingRequests)
            this.db.pendingRequests = {};

        return Promise.resolve();
    }

    onText(message, reply) {
        const text = message.text;

        const triggers = this.db.triggers[message.chat.id] || {};
        for (let trigger in triggers) {
            if (text.indexOf(trigger) === -1) continue;
            const re = new RegExp("(?:\\b|^)(" + Util.escapeRegExp(trigger) + ")(?:\\b|$)", "g");
            const match = re.exec(text);
            if (!match) continue;
            const media = triggers[trigger];

            this.log.verbose("Match on " + Util.buildPrettyChatName(message.chat));
            reply({type: media.type, [media.type]: media.fileId});
        }

        this.setStepOne(message, reply);

        // this.unset(message, reply);
    }

    onAudio(message, reply) {
        this.setStepTwo(message, reply, "audio");
    }
    onDocument(message, reply) {
        this.setStepTwo(message, reply, "document");
    }
    onPhoto(message, reply) {
        this.setStepTwo(message, reply, "photo");
    }
    onSticker(message, reply) {
        this.setStepTwo(message, reply, "sticker");
    }
    onVideo(message, reply) {
        this.setStepTwo(message, reply, "video");
    }
    onVoice(message, reply) {
        this.setStepTwo(message, reply, "voice");
    }

    setStepOne(message, reply) {
        const args = Util.parseCommand(message.text, "mset");
        if (!args) return;
        if (args.length !== 2) {
            reply({
                type: "text",
                text: "Syntax: /mset `trigger`",
                options: {
                    parse_mode: "Markdown"
                }
            });
            return;
        }

        this.log.verbose("Triggered stepOne on " + Util.buildPrettyChatName(message.chat));

        if (!this.db.pendingRequests[message.chat.id])
            this.db.pendingRequests[message.chat.id] = {};

        reply({
            type: "text",
            text: "Perfect! Now send me the media as a reply to this message!"
        })
        .then(message => {
            this.db.pendingRequests[message.chat.id][message.message_id] = args[1];
        });
    }

    setStepTwo(message, reply, mediaType) {
        // is this a reply for a "now send media" message?
        if (!message.hasOwnProperty('reply_to_message')) return;
        // are there pending requests for this chat?
        if (!this.db.pendingRequests[message.chat.id]) return;

        // foreach request (identified by the "now send media" message id)
        for (let request in this.db.pendingRequests[message.chat.id]) {
            // if the message is not replying just continue
            if (message.reply_to_message.message_id !== request) continue;

            const trigger = this.db.pendingRequests[message.chat.id][request];

            // do we have triggers for this chat?
            if (!this.db.triggers[message.chat.id])
                this.db.triggers[message.chat.id] = {};

            // build the trigger
            var fileId = null;
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

            reply({type: "text", text: "Done! Enjoy!"});
            return;
        }
    }

    /*
    unset(message, reply) {
        const text = message.text;

        const args = Util.parseCommand(text, "munset");
        if (!args) return;
        if (args.length != 2) {
            reply({type: "text", text: "Syntax: /munset trigger"});
            return;
        }
        const key = String(args[1]);
        if (this.replacements[ID]) {
            this.replacements.splice(ID, 1);
            reply({type: "text", text: "Deleted."})
        } else {
            reply({type: "text", text: "No such expression."})
        }
    }
    */
}