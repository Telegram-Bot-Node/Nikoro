const Plugin = require("./../Plugin");

module.exports = class Welcome extends Plugin {

    static get plugin() {
        return {
            name: "Welcome",
            description: "Says welcome and goodbye."
        };
    }

    onNewChatParticipant({message}) {
        if (!this.db[message.chat.id]) this.db[message.chat.id] = [];
        const member = message.new_chat_member;
        if (this.db[message.chat.id].indexOf(member.id) !== -1) return;
        this.db[message.chat.id].push(member.id);
        this.sendMessage(message.chat.id, "Welcome " + (member.username ? `@${member.username}!` : `${member.first_name}!`));
    }

    onLeftChatParticipant({message}) {
        if (!this.db[message.chat.id]) this.db[message.chat.id] = [];
        const member = message.new_chat_member;
        if (this.db[message.chat.id].indexOf(member.id) !== -1) return;
        this.db[message.chat.id].push(member.id);
        this.sendMessage(message.chat.id, "Goodbye " + (member.username ? `@${member.username}!` : `${member.first_name}!`));
    }
};