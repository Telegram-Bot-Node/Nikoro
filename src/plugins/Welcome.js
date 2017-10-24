const Plugin = require("./../Plugin");

module.exports = class Welcome extends Plugin {

    static get plugin() {
        return {
            name: "Welcome",
            description: "Says welcome and goodbye to users when they join or leave a group."
        };
    }

    onNewChatMembers({message}) {
        if (!this.db[message.chat.id]) this.db[message.chat.id] = [];
        this.sendMessage(
            message.chat.id,
            "Welcome " +
            message.new_chat_members
                .map(m => m.username ? `@${m.username}` : `${m.first_name}`)
                .join(", ") +
            "!");
    }

    onLeftChatMember({message}) {
        if (!this.db[message.chat.id]) this.db[message.chat.id] = [];
        this.sendMessage(
            message.chat.id,
            "Goodbye " +
            (message.left_chat_member.username ?
                `@${message.left_chat_member.username}` :
                `${message.left_chat_member.first_name}`) +
            "!");
    }
};