const Plugin = require("./../Plugin");

module.exports = class Welcome extends Plugin {

    static get plugin() {
        return {
            name: "Welcome",
            description: "Says welcome and goodbye.",
        };
    }

    onNewChatParticipant(item, reply) {
        if (!this.db[item.chat.id]) this.db[item.chat.id] = [];
        const member = item.new_chat_member;
        if (this.db[item.chat.id].indexOf(member.id) !== -1) return;
        this.db[item.chat.id].push(member.id);
        reply({
            type: "text",
            text: "Welcome " + (member.username ? `@${member.username}!` : `${member.first_name}!`)
        });
    }

    onLeftChatParticipant(item, reply) {
        if (!this.db[item.chat.id]) this.db[item.chat.id] = [];
        const member = item.new_chat_member;
        if (this.db[item.chat.id].indexOf(member.id) !== -1) return;
        this.db[item.chat.id].push(member.id);
        reply({
            type: "text",
            text: "Goodbye " + (member.username ? `@${member.username}!` : `${member.first_name}!`)
        });
    }
};