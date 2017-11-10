const Plugin = require("./../Plugin");
const Util = require("./../Util");

module.exports = class AuthPlugin extends Plugin {
    static get plugin() {
        return {
            name: "Auth",
            description: "Plugin to handle authentication",
            help: `Commands:

/modlist, /adminlist to list mods and admins respectively
/addmod, /delmod to add or remove mods
/addadmin, /deladmin to add or remove admins`
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
            deladmin: ({message, args}) => this.doAction("admin", "removeAdmin", message, args)
        };
    }

    doAction(privilege, command, {from, chat}, args) {
        switch (privilege) {
        case "mod":
            if (!this.auth.isMod(from.id, chat.id))
                return "Insufficient privileges.";
            break;
        case "admin":
            if (!this.auth.isAdmin(from.id, chat.id))
                return "Insufficient privileges.";
            break;
        default:
            return "Unknown privilege: " + privilege;
        }

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

        this.auth[command](target, chat.id);
        return "Done.";
    }
};