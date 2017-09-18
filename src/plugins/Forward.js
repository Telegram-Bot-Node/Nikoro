const Plugin = require("./../Plugin");

module.exports = class Forward extends Plugin {

    static get plugin() {
        return {
            name: "Forward",
            description: "Forward messages to a channel or group on command.",
            help: "Reply /fwd to a message. Use `/fwdset <ID/name>` to set the destination."
        };
    }

    onCommand({message, command, args}, reply, forward) {
        const chatID = message.chat.id;
        switch (command) {
        case "fwdset":
            if (args.length !== 1) {
                reply({
                    type: "text",
                    text: "Syntax: /fwdset <ID>"
                });
                return;
            }
            if (!this.db[chatID]) this.db[chatID] = {};
            this.db[chatID].target = args[0];
            reply({
                type: "text",
                text: "Done."
            });
            return;
        case "fwd":
            if (!this.db[chatID]) {
                reply({
                    type: "text",
                    text: "Use /fwdset to set the target channel/group."
                });
                return;
            }
            if (!message.reply_to_message) {
                reply({
                    type: "text",
                    text: "Reply to a message with /fwd to forward it."
                });
                return;
            }
            forward(this.db[chatID].target, message.reply_to_message.chat.id, message.reply_to_message.message_id);
            return;
        default:
            return;
        }
    }
};