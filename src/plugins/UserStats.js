const Plugin = require("./../Plugin");

module.exports = class UserStats extends Plugin {
    static get plugin() {
        return {
            name: "UserStats",
            description: "Get user stats on message count.",
            help: "Enter /userstats to get statistics."
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

    onCommand({message, command}) {
        if (command !== "userstats" && command !== "wordstats") return;

        let text = `Total messages:\n\n`;
        const statsObject = this.db["stat" + message.chat.id];
        const totalCount = statsObject.totalMessageCount;
        const userList = Object.keys(statsObject)
            .map(item => statsObject[item])
            .filter(item => typeof item === "object");

        switch (command) {
        case "userstats":
            text += userList
                // Sort the users by messageCount
                .sort((a, b) => b.messageCount - a.messageCount)
                .map(user => {
                    const percentage = (user.messageCount / totalCount * 100).toFixed(4);
                    return `${user.username}: ${user.messageCount} (${percentage}%)`;
                })
                .join("\n");
            break;
        case "wordstats":
            text += userList
                // Sort the users by wordCount
                .sort((a, b) => b.wordCount - a.wordCount)
                .map(user => {
                    const averageWords = (user.wordCount / user.messageCount).toFixed(4);
                    return `${user.username}: ${user.wordCount} words (${averageWords} words/message)`;
                })
                .join("\n");
            break;
        default:
            return;
        }
        this.sendMessage(message.chat.id, text);
    }
};
