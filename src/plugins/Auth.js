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

    get commands() {
        return {
            modlist: ({message}) => JSON.stringify(this.auth.getMods(message.chat.id)),
            adminlist: ({message}) => JSON.stringify(this.auth.getAdmins(message.chat.id)),
            addmod: ({message, args}) => this.doAction("mod", "addMod", message, args),
            delmod: ({message, args}) => this.doAction("mod", "removeMod", message, args),
            addadmin: ({message, args}) => this.doAction("admin", "addAdmin", message, args),
            deladmin: ({message, args}) => this.doAction("admin", "removeAdmin", message, args),
            importmods: ({message, args}) => this.import("mod", "addMod", message, args),
            importadmins: ({message, args}) => this.import("admin", "addAdmin", message, args)
        };
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

    import(privilege, command, message) {
        const err = this.checkPrivilege(privilege, message);
        if (err)
            return err;

        this.getChatAdministrators(message.chat.id)
            .then(users => users.forEach(user => this.auth[command](user, message.chat.id)))
            .catch(err => this.sendMessage(message.chat.id, "An error occurred: " + err));
    }

    doAction(privilege, command, message, args) {
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

        this.auth[command](target, message.chat.id);
        return "Done.";
    }
};