const Plugin = require("./../Plugin");

module.exports = class UserStats extends Plugin {
    static get plugin() {
        return {
            name: "UserStats",
            description: "Get user stats on message count.",
            help: "Enter /userstats to get statistics.",
            needs: {
                database: true
            }
        };
    }

    wordCount(text) {
        const words = text.trim().replace(/\s+/gi, ' ').split(' ');
        // This checks if the first element of the `words` array is there, and
        // if it is truthy (an empty string, which is the case when `text` is
        // empty or contains only spaces, will not trigger this, returning 0).
        if (words[0])
            return words.length;
        return 0;
    }

    onText({message}) {
        // Reject inline messages
        if (!message.chat) return;

        if (!message.from.username) return;

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
    }

    onCommand({message, command, args}, reply) {
        if (command !== "userstats" && command !== "wordstats") return;

        let text = `Total messages:\n\n`;
        const statsObject = this.db["stat" + message.chat.id];
        const totalCount = statsObject.totalMessageCount;
        let userList = Object.keys(statsObject)
            .map(item => statsObject[item])
            .filter(item => typeof item === "object");

        switch (command) {
        case "userstats":
            userList = userList.sort((a, b) => b.messageCount - a.messageCount);
            for (const user of userList) {
                const percentage = (user.messageCount / totalCount * 100).toFixed(4);
                text += `${user.username}: ${user.messageCount} (${percentage}%)\n`;
            }
            break;
        case "wordstats":
            userList = userList.sort((a, b) => b.wordCount - a.wordCount);
            for (const user of userList) {
                if (!user.wordCount) continue;
                const averageWords = (user.wordCount / user.messageCount).toFixed(4);
                text += `${user.username}: ${user.wordCount} words (${averageWords} words/message)\n`;
            }
            break;
        default:
            return;
        }
        reply({type: 'text', text});
    }
};
