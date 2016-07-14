import Plugin from "./../Plugin";
import Util from "./../Util";

export default class MediaSet extends Plugin {

    plugin = {
        name: "MediaSet",
        description: "Media-capable set command",
        help: '',
    };

    constructor(a, b) {
        super(a, b);
        /*
        triggers = {
            "chat_id": {
                "trigger": {}
            }
        }
        */
        this.db.triggers = {};
        this.db.pending_requests = {};
    }

    onText(message, reply) {
        const text = message.text;

        const triggers = this.db.triggers[message.chat.id] || {};
        for (let trigger in triggers) {
            if (message.text.indexOf(trigger) == -1) continue;
            const re = new RegExp("\\b(" + Util.escapeRegExp(trigger) + ")\\b","g");
            const match = re.exec(message.text);
            if (!match) continue;
            const media = triggers[trigger];
            console.log(media);
            reply({type: media.type, [media.type]: media.fileId});
        }

        this.setStepOne(message, reply);

        //this.unset(message, reply);
    };


    onAudio(message, reply){
        this.setStepTwo(message, reply, "audio");
    }
    onDocument(message, reply){
        this.setStepTwo(message, reply, "document");
    }
    onPhoto(message, reply){
        this.setStepTwo(message, reply, "photo");
    }
    onSticker(message, reply){
        this.setStepTwo(message, reply, "sticker");
    }
    onVideo(message, reply){
        this.setStepTwo(message, reply, "video");
    }
    onVoice(message, reply){
        this.setStepTwo(message, reply, "voice");
    }

    setStepOne(message, reply){
        const args = Util.parseCommand(message.text, "mset");
        if (!args) return;
        if (args.length != 2) {
            reply({type: "text", text: "Syntax: /mset trigger"});
            return;
        }

        if(!this.db.pending_requests[message.chat.id])
            this.db.pending_requests[message.chat.id] = {}

        reply({
            type: "text",
            text: "Perfect! Now send me the media as a reply to this message!"
        })
        .then(message => {
            this.db.pending_requests[message.chat.id][message.message_id] = args[1];
        });
    }

    setStepTwo(message, reply, mediaType) {
        //is this a reply for a "now send media" message?
        if (!message.hasOwnProperty('reply_to_message')) return;
        if (!this.db.pending_requests[message.chat.id]) return;

        for (let request in this.db.pending_requests[message.chat.id]) {
            if (message.reply_to_message.message_id != request) return;
            const trigger = this.db.pending_requests[message.chat.id][request];

            if(!this.db.triggers[message.chat.id])
                this.db.triggers[message.chat.id] = {};

            console.log(mediaType);
            console.log(message.voice);
            var fileId = null;
            if(mediaType == "photo")
                fileId = message.photo[0].file_id;
            else
                fileId = message[mediaType].file_id;

            this.db.triggers[message.chat.id][trigger] = {
                "type": mediaType,
                "fileId": fileId
            };

            delete this.db.pending_requests[message.chat.id][request];

            reply({type: "text", text: "Done! Enjoy!"})
            return;
        }

    }

    /*unset(message, reply) {
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
    }*/
};

