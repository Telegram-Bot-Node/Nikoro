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

    wordCount(text) {
        let words = text.trim().replace(/\s+/gi, ' ').split(' ');
        // This checks if the first element of the `words` array is there, and
        // if it is truthy (an empty string, which is the case when `text` is
        // empty or contains only spaces, will not trigger this, returning 0).
        if (words[0])
            return words.length;
        return 0;
    }

    proxy(eventName, message) {
        if (!message.from.username) return Promise.resolve();
        const chatId = message.chat.id;
        const userId = message.from.id;
        if (!this.db["stat" + chatId]) {
            this.db["stat" + chatId] = {};
            this.db["stat" + chatId].totalMessageCount = 0;
            this.db["stat" + chatId].totalWordCount = 0;
        }
        if (!this.db["stat" + chatId][userId]) {
            this.db["stat" + chatId][userId] = {
                userId,
                username: message.from.username,
                messageCount: 0,
                wordCount: 0
            };
        }
        this.db["stat" + chatId][userId].messageCount++;
        this.db["stat" + chatId].totalMessageCount++;

        if (message.text) {
            const wc = this.wordCount(message.text);
            if (!this.db["stat" + chatId].totalWordCount) {
                this.db["stat" + chatId].totalWordCount = 0;
            }
            this.db["stat" + chatId].totalWordCount += wc;
            if (!this.db["stat" + chatId][userId].wordCount) {
                this.db["stat" + chatId][userId].wordCount = 0;
            }
            this.db["stat" + chatId][userId].wordCount += wc;
        }
        return Promise.resolve();
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
            text += `${user.username} [${user.userId}]: ${user.messageCount} (${percentage}%)`;
            if (user.wordCount) {
                const averageWords = (user.wordCount / user.messageCount).toFixed(4);
                text += ` - ${user.wordCount} words (${averageWords} words/message)`;
            }
            text += `\n`;
        }
        reply({type: 'text', text});
    }
}
