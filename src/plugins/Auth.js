import Plugin from "./../Plugin";
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

    onCommand({message, command, args}, reply) {
        const author = message.from.id;
        const chat = message.chat.id;
        const targetId = args[0];

        switch (command) {
        case "modlist":
            return reply({
                type: "text",
                text: JSON.stringify(Auth.getMods(chat))
            });
        case "adminlist":
            return reply({
                type: "text",
                text: JSON.stringify(Auth.getAdmins(chat))
            });
        // The code from here on is admin-only.
        case "addmod":
            if (!Auth.isAdmin(author, chat)) return;

            Auth.addMod(targetId, chat);

            return reply({
                type: "text",
                text: "Done."
            });
        case "addadmin":
            if (!Auth.isAdmin(author, chat)) return;

            Auth.addAdmin(targetId, chat);

            return reply({
                type: "text",
                text: "Done."
            });
        case "delmod":
            if (!Auth.isAdmin(author, chat)) return;

            Auth.removeMod(targetId, chat);

            return reply({
                type: "text",
                text: "Done."
            });
        case "deladmin":
            if (!Auth.isAdmin(author, chat)) return;

            Auth.removeAdmin(targetId, chat);

            return reply({
                type: "text",
                text: "Done."
            });
        default:
            return;
        }
    }
}