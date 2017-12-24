const Plugin = require("../Plugin");

module.exports = class SetTitle extends Plugin {
    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
    }

    static get plugin() {
        return {
            name: "SetTitle",
            description: "Sets the chat's title.",
            help: "Syntax: /settitle <title>"
        };
    }

    onCommand({message, command, args}) {
        if (command !== "settitle") return;
        if (!this.auth.isMod(message.from.id, message.chat.id))
            return "Insufficient privileges.";
        if (args.length === 0)
            return "Syntax: /settitle <title>";
        const title = args.join(" ");
        this.setChatTitle(message.chat.id, title);
    }
};
