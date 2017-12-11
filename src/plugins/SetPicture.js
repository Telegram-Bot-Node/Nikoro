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

    get commands() {
        return {
            setpicture: ({message}) => {
                if (!message.reply_to_message || !message.reply_to_message.photo)
                    return "Reply to a picture with the caption /setpicture to set the chat's picture.";
                if (!this.auth.isMod(message.from.id, message.chat.id))
                    return "Insufficient privileges.";
                this.setPhoto(message.reply_to_message);
            }
        };
    }

    setPhoto(message) {
        const fileId = message.photo[message.photo.length - 1].file_id;
        this.downloadFile(fileId, os.tmpdir())
            .then(path => this.setChatPhoto(message.chat.id, path))
            .catch(err => this.sendMessage(message.chat.id, "An error occurred:\n\n" + err));
    }

    onPhoto({message}) {
        if (!message.caption)
            return;
        if (!message.caption.startsWith("/setpicture"))
            return;
        if (!this.auth.isMod(message.from.id, message.chat.id)) {
            this.sendMessage(message.chat.id, "Insufficient privileges.");
            return;
        }
        this.setPhoto(message);
    }
};
