// Author: Cristian Achille
// Date: 22-10-2016

const Plugin = require("../Plugin");

module.exports = class Roll extends Plugin {

    static get plugin() {
        return {
            name: 'Roll',
            description: 'Test your luck with this fancy plugin',
            help: ` command: 
                \`/roll NdM\` rolls \`N\` dices of \`M\` faces
                example: ^/roll 1d6^`
        };
    }

    onCommand({message, command, args}) {
        if (command !== "roll") return;

        if (!args[0])
            return this.sendMessage(message.chat.id, "You can't roll the air, give me something! (example: /roll 1d6)");

        const n = Number(args[0].split('d')[0]);
        const m = Number(args[0].split('d')[1]);
        if (isNaN(n) || isNaN(m))
            return this.sendMessage(message.chat.id, "I need some numbers (example: /roll 1d6)");

        let result = 0;
        for (let i = 0; i < n; i++)
            result += Math.floor(Math.random() * m) + 1;

        this.sendMessage(message.chat.id, result);
    }
};
