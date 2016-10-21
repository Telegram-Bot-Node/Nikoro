import Plugin from "./../Plugin";
import Util from "../Util";

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

    onText(message, reply) {
        const parts = Util.parseCommand(message.text, "userstats");
        if (!parts) return;
        let text = `Total Messages:\n\n`;
        const statsObject = this.db["stat" + message.chat.id];
        const totalCount = statsObject.totalMessageCount;
        const userList = Object.keys(statsObject)
            .map(item => {
                return statsObject[item];
            }).filter(item => {
                return typeof item === "object";
            }).sort((a, b) => {
                return b.messageCount - a.messageCount;
            });
        for (let user of userList) {
            if (user) {
                const percentage = (user.messageCount / totalCount * 100).toFixed(4);
                text += `${user.username} [${user.userId}]: ${user.messageCount} (${percentage}%)\n`;
            }
        }
        reply({type: 'text', text});
    }
}
