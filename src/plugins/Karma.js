const Plugin = require("./../Plugin");

module.exports = class Karma extends Plugin {

    static get plugin() {
        return {
            name: "Karma",
            description: "Keeps scores about users.",
            help: "@username++, @username--."
        };
    }

    onCommand({message, command}) {
        if (command !== "karmachart") return;
        let text = "";
        for (const username in this.db[message.chat.id]) {
            if (!this.db[message.chat.id].hasOwnProperty(username)) continue;
            text += `${username}: ${this.db[message.chat.id][username]} points\n`;
        }
        if (text === "")
            return this.sendMessage(message.chat.id, "No score yet.");
        this.sendMessage(message.chat.id, text);
    }

    onText({message}) {
        // Telegram usernames are 5 or more characters long
        // and contain [A-Z], [a-z], [0-9].
        // Match that, plus either "++" or "--"
        const regex = /@([a-z0-9_]{5,})(\+\+|--)/i;
        if (!regex.test(message.text)) return;
        const chatId = message.chat.id;

        const parts = message.text.match(regex);
        const target = parts[1];
        const operator = parts[2];

        if (target.toLowerCase() === message.from.username.toLowerCase())
            return this.sendMessage(message.chat.id, "You can't karma yourself!");

        if (!this.db[chatId])
            this.db[chatId] = {};
        if (!this.db[chatId][target])
            this.db[chatId][target] = 0;

        this.db[chatId][target] += (operator === "++") ? +1 : -1;

        this.sendMessage(message.chat.id, `${target} now has ${this.db[chatId][target]} karma points`);
    }
};