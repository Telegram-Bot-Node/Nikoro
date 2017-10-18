const Plugin = require("./../Plugin");
module.exports = class AuthPlugin extends Plugin {

    static get plugin() {
        return {
            name: "Auth",
            description: "Plugin to handle authentication",
            help: ""
        };
    }

    constructor(listener, bot, config, auth) {
        super(listener, bot, config, auth);

        this.auth = auth;
    }

    onCommand({message, command, args}) {
        const author = message.from.id;
        const chat = message.chat.id;
        const targetId = args[0];

        switch (command) {
        case "modlist":
            return this.sendMessage(message.chat.id, JSON.stringify(this.auth.getMods(chat)));
        case "adminlist":
            return this.sendMessage(message.chat.id, JSON.stringify(this.auth.getAdmins(chat)));
        // The code from here on is admin-only.
        case "addmod":
            if (!this.auth.isAdmin(author, chat)) return;

            this.auth.addMod(targetId, chat);

            return this.sendMessage(message.chat.id, "Done.");
        case "addadmin":
            if (!this.auth.isAdmin(author, chat)) return;

            this.auth.addAdmin(targetId, chat);

            return this.sendMessage(message.chat.id, "Done.");
        case "delmod":
            if (!this.auth.isAdmin(author, chat)) return;

            this.auth.removeMod(targetId, chat);

            return this.sendMessage(message.chat.id, "Done.");
        case "deladmin":
            if (!this.auth.isAdmin(author, chat)) return;

            this.auth.removeAdmin(targetId, chat);

            return this.sendMessage(message.chat.id, "Done.");
        default:
            return;
        }
    }
};