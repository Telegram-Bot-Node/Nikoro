const Plugin = require("./../Plugin");

module.exports = class Karma extends Plugin {

    static get plugin() {
        return {
            name: "Karma",
            description: "Keeps scores about users.",
            help: "@username++, @username--. Use /karmachart to view scores."
        };
    }

    get commands() { return {
        karmachart: ({message}) => {
            if (!this.db[message.chat.id]) return "No scores yet.";
            const users = Object.keys(this.db[message.chat.id]);
            if (users.length === 0) return "No scores yet.";
            return users.map(user => `${user}: ${this.db[message.chat.id][user]} points`).join("\n");
        }
    };}

    onText({message}, reply) {
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
            return reply({
                type: "text",
                text: "You can't karma yourself!"
            });

        if (!this.db[chatId])
            this.db[chatId] = {};
        if (!this.db[chatId][target])
            this.db[chatId][target] = 0;

        this.db[chatId][target] += (operator === "++") ? +1 : -1;

        reply({
            type: "text",
            text: `${target} now has ${this.db[chatId][target]} karma points`
        });
    }
};