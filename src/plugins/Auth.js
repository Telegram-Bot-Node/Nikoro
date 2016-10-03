import Plugin from "./../Plugin";
import Util from "./../Util";
import Auth from "./../helpers/Auth";

export default class AuthPlugin extends Plugin {

    static get plugin() {
        return {
            name: "Auth",
            description: "Plugin to handle authentication",
            help: "",

            visibility: Plugin.Visibility.VISIBLE,
            type: Plugin.Type.SPECIAL
        };
    }

    onText(message, reply) {
        const author = message.from.id;
        const chat = message.chat.id;

        if (message.text === "/modlist") {
            return reply({
                type: "text",
                text: JSON.stringify(Auth.getMods(chat))
            });
        }

        if (message.text === "/adminlist") {
            return reply({
                type: "text",
                text: JSON.stringify(Auth.getAdmins(chat))
            });
        }

        // The code from here on is admin-only.
        if (!Auth.isAdmin(author, chat)) return;

        var args = Util.parseCommand(message.text, "addmod");
        if (args) {
            const modId = Number(args[1]);

            Auth.addMod(modId, chat);

            reply({
                type: "text",
                text: "Done."
            });
            return;
        }

        args = Util.parseCommand(message.text, "addadmin");
        if (args) {
            const adminId = Number(args[1]);

            Auth.addAdmin(adminId, chat);

            reply({
                type: "text",
                text: "Done."
            });
            return;
        }

        args = Util.parseCommand(message.text, "delmod");
        if (args) {
            const userId = Number(args[1]);

            Auth.removeMod(userId, chat);

            reply({
                type: "text",
                text: "Done."
            });
            return;
        }

        args = Util.parseCommand(message.text, "deladmin");
        if (args) {
            const userId = Number(args[1]);

            Auth.removeAdmin(userId, chat);

            reply({
                type: "text",
                text: "Done."
            });
            return;
        }
    }
}