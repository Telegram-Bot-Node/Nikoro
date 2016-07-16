import Plugin from "./../Plugin";
import Util from "./../Util";
import Rebridge from "rebridge";
import Auth from "./../Auth";

var db = new Rebridge();

export default class AuthPlugin extends Plugin {
    get plugin() {
        return {
            name: "Auth"
        };
    }

    onText(message, reply) {
        if (message.text === "/modlist")
            return reply({
                type: "text",
                text: JSON.stringify(db.mods)
            });
        if (message.text === "/adminlist")
            return reply({
                type: "text",
                text: JSON.stringify(db.admins)
            });
        
        const author = message.from.id;

        // The code from here on is admin-only.
        if (!Auth.isAdmin(author)) return;

        var parts;

        parts = Util.parseCommand(message.text, "addmod");
        if (parts) {
            parts[1] = Number(parts[1]);
            db.mods.push(parts[1]);
            reply({
                type: "text",
                text: "Done."
            });
            return;
        }
        
        parts = Util.parseCommand(message.text, "addadmin");
        if (parts) {
            parts[1] = Number(parts[1]);
            db.admins.push(parts[1]);
            reply({
                type: "text",
                text: "Done."
            });
            return;
        }
        
        parts = Util.parseCommand(message.text, "delmod");
        if (parts) {
            parts[1] = Number(parts[1]);
            var mods = db.mods.splice(0);
            const index = mods.indexOf(parts[1]);
            mods.splice(index, 1);
            db.mods = mods;
            reply({
                type: "text",
                text: "Done."
            });
            return;
        }
        
        parts = Util.parseCommand(message.text, "deladmin");
        if (parts) {
            parts[1] = Number(parts[1]);
            var admins = db.admins.splice(0);
            const index = admins.indexOf(parts[1]);
            admins.splice(index, 1);
            db.admins = admins;
            reply({
                type: "text",
                text: "Done."
            });
            return;
        }
    }
}