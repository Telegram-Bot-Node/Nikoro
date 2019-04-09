const os = require("os");
const Plugin = require("../Plugin");

module.exports = class SetPicture extends Plugin {
    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
    }

    static get plugin() {
        return {
            name: "SetPicture",
            description: "Sets the chat's picture.",
            help: "Send a picture with the caption /setpicture to set the chat's picture."
        };
    }

    onCommand({message, command}) {
        if (command !== "setpicture") return;
        if (!message.reply_to_message || !message.reply_to_message.photo)
            return "Reply to a picture with the caption /setpicture or /setimage to set the chat's picture.";
        if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
            return "Insufficient privileges (chat admin required).";
        return this.setPhoto(message.reply_to_message);
    }

    onPhoto({message}) {
        if (!message.caption)
            return;
        if (!message.caption.startsWith("/setpicture"))
            return;
        if (!message.caption.startsWith("/setimage"))
            return;
        if (!this.auth.isChatAdmin(message.from.id, message.chat.id))
            return "Insufficient privileges (chat admin required).";
        return this.setPhoto(message);
    }

    async setPhoto(message) {
        const fileId = message.photo[message.photo.length - 1].file_id;
        const path = await this.downloadFile(fileId, os.tmpdir())
        try {
            await this.setChatPhoto(message.chat.id, path);
        } catch (e) {
            return "Couldn't set the chat picture.";
        }
    }
};
