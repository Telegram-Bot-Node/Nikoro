const Plugin = require("./../Plugin");

module.exports = class Forward extends Plugin {

    static get plugin() {
        return {
            name: "Forward",
            description: "Forward messages to a channel or group on command.",
            help: "Reply /fwd to a message. Use `/fwdset <ID/name>` to set the destination."
        };
    }

    get commands() {
        return {
            fwdset: ({message, args}) => {
                const chatID = message.chat.id;
                if (args.length !== 1)
                    return "Syntax: /fwdset <ID>";
                if (!this.db[chatID])
                    this.db[chatID] = {};
                this.db[chatID].target = args[0];
                return "Done.";
            },
            fwd: ({message}) => {
                const chatID = message.chat.id;
                if (!this.db[chatID])
                    return "Use /fwdset to set the target channel/group.";
                if (!message.reply_to_message)
                    return "Reply to a message with /fwd to forward it.";
                this.forwardMessage(
                    this.db[chatID].target,
                    message.reply_to_message.chat.id,
                    message.reply_to_message.message_id
                );
            }
        };
    }
};