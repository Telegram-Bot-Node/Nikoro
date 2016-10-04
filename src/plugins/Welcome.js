import Plugin from "./../Plugin";

export default class Welcome extends Plugin {

    static get plugin() {
        return {
            name: "Welcome",
            description: "Welcomes users.",
            needs: {
                database: 1
            }
        };
    }

    onNewChatParticipant(item, reply) {
        if (!this.db[item.chat.id]) this.db[item.chat.id] = [];
        const member = item.new_chat_member;
        if (this.db[item.chat.id].indexOf(member.id) !== -1) return;
        this.db[item.chat.id].push(member.id);
        reply({
            type: "text",
            text: member.username ? `Welcome @${member.username}!` : `Welcome ${member.first_name}!`
        });
    }
}