const Plugin = require("./../Plugin");
const Util = require("./../Util");

module.exports = class AuthPlugin extends Plugin {
    static get plugin() {
        return {
            name: "Auth",
            description: "Plugin to handle authentication",
            help: `Commands:

/modlist to list mods
/addmod, /delmod to add or remove mods
/importmods to import the chat's admins as this bot's mods

The same commands work with admins (eg. /adminlist, /addadmin and so on).`
        };
    }

    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
    }

    onCommand({message, command, args}) {
        switch (command) {
            case "modlist":
                return JSON.stringify(this.auth.getMods(message.chat.id));
            case "adminlist":
                return JSON.stringify(this.auth.getAdmins(message.chat.id));
            case "addmod":
                return this.doAction("mod", this.auth.addMod, message, args);
            case "delmod":
                return this.doAction("mod", this.auth.removeMod, message, args);
            case "addadmin":
                return this.doAction("admin", this.auth.addAdmin, message, args);
            case "deladmin":
                return this.doAction("admin", this.auth.removeAdmin, message, args);
            case "importmods":
                return this.import("mod", "addMod", message, args);
            case "importadmins":
                return this.import("admin", "addAdmin", message, args);
        }
    }

    checkPrivilege(privilege, {from, chat}) {
        switch (privilege) {
            case "mod":
                if (!this.auth.isMod(from.id, chat.id))
                    return "Insufficient privileges (mod required).";
                break;
            case "admin":
                if (!this.auth.isAdmin(from.id, chat.id))
                    return "Insufficient privileges (admin required).";
                break;
            default:
                return "Unknown privilege: " + privilege;
        }
    }

    async import(privilege, action, message) {
        const err = this.checkPrivilege(privilege, message);
        if (err)
            return err;

        const users = await this.getChatAdministrators(message.chat.id);
        const fn = action.bind(this.auth);
        for (const user of users)
            fn(user, message.chat.id);
    }

    doAction(privilege, action, message, args) {
        const err = this.checkPrivilege(privilege, message);
        if (err)
            return err;

        if (args.length !== 1)
            return "Please supply one ID/username.";
        let target;
        if (Number(args[0]))
            target = Number(args[0]);
        else {
            try {
                target = Util.nameResolver.getUserIDFromUsername(args[0]);
            } catch (e) {
                return "Couldn't resolve username. Did you /enable UserInfo?";
            }
        }
        if (!target)
            return "Invalid user (couldn't parse ID, or unknown username).";

        action.bind(this.auth)(target, message.chat.id);
        return "Done.";
    }
};