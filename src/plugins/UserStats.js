import Plugin from "./../Plugin";

export default class UserStats extends Plugin {
    static get plugin() {
        return {
            name: "UserStats",
            description: "Get user stats on message count.",
            help: "Enter /UserStats to get statistics.",
            type: Plugin.Type.PROXY,
            needs: {
                database: true
            }
        };
    }

    proxy(eventName, message) {
        if (message.from.username) {
            const chatId = message.chat.id;
            const userId = message.from.id;
            if (!this.db["stat" + chatId]) {
                this.db["stat" + chatId] = {};
                this.db["stat" + chatId].totalMessageCount = 0;
            }
            if (!this.db["stat" + chatId][userId]) {
                this.db["stat" + chatId][userId] = {
                    id: userId,
                    username: message.from.username,
                    messageCount: 0
                };
            }
            this.db["stat" + chatId][userId].messageCount++;
            this.db["stat" + chatId].totalMessageCount++;
        }
        return Promise.resolve(message);
    }

    onText(message, reply) {
        if (message.text === '/UserStats') {
            let text = `Total Messages:\n\n`;
            const statsObject = this.db["stat" + message.chat.id];
            const totalCount = statsObject.totalMessageCount;
            for (let key in statsObject) {
                if (key !== 'totalMessageCount') {
                    const username = statsObject[key].username;
                    const id = statsObject[key].id;
                    const count = statsObject[key].messageCount;
                    const percentage = (count / totalCount * 100).toFixed(4);
                    text += `${username} [${id}]: ${count} (${percentage}%)\n`;
                }
            }
            reply({type: 'text', text: text});
        }
    }
}
