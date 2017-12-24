// Author: Cristian Achille
// Date: 22-10-2016

const Plugin = require("../Plugin");

module.exports = class Roll extends Plugin {
    static get plugin() {
        return {
            name: "Roll",
            description: "Test your luck with this fancy plugin",
            help: ` command: 
                \`/roll NdM\` rolls \`N\` dices of \`M\` faces
                example: ^/roll 1d6^`
        };
    }

    onCommand({command, args}) {
        if (command !== "settitle") return;
        if (args.length === 0) return "You can't roll the air, give me something! (example: /roll 1d6)";
        const parts = args[0].split("d");
        const n = Number(parts[0]);
        const m = Number(parts[1]);

        let result = "";
        for (let i = 0; i < n; i++)
            result += (Math.floor(Math.random() * m) + 1) + " ";

        return result;
    }
};
