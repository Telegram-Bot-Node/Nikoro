import Plugin from "./../Plugin";

export default class UserStats extends Plugin {
    static get plugin() {
        return {
            name: "UserStats",
            description: "Get user stats on message count.",
            help: "Enter /userstats to get statistics.",
            type: Plugin.Type.PROXY,
            needs: {
                database: true
            }
        };
    }

    proxy(eventName, message) {
        // Reject inline messages
        if (!message.chat) return;

        if (!message.from.username) return;

        const chatId = message.chat.id;
        const userId = message.from.id;
        if (!this.db["stat" + chatId]) {
            this.db["stat" + chatId] = {};
            this.db["stat" + chatId].totalMessageCount = 0;
        }
        if (!this.db["stat" + chatId][userId]) {
            this.db["stat" + chatId][userId] = {
                userId,
                username: message.from.username,
                messageCount: 0
            };
        }
        this.db["stat" + chatId][userId].messageCount++;
        this.db["stat" + chatId].totalMessageCount++;
        return Promise.resolve(message);
    }

    onCommand({message, command, args}, reply) {
        if (command !== "userstats") return;

        let text = `Total messages:\n\n`;
        const statsObject = this.db["stat" + message.chat.id];
        const totalCount = statsObject.totalMessageCount;
        const userList = Object.keys(statsObject)
            .map(item => statsObject[item])
            .filter(item => typeof item === "object")
            .sort((a, b) => b.messageCount - a.messageCount);

        for (const user of userList) {
            const percentage = (user.messageCount / totalCount * 100).toFixed(4);
            text += `${user.username} [${user.userId}]: ${user.messageCount} (${percentage}%)\n`;
        }
        reply({type: 'text', text});
    }
}
