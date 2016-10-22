// Author: Cristian Achille
// Date: 22-10-2016

import Plugin from '../Plugin';

export default class Roll extends Plugin {

    static get plugin() {
        return {
            name: 'Roll',
            description: 'Test your luck with this fancy plugin',
            help: ` command: 
                \`/roll NdM\` rolls \`N\` dices of \`M\` faces
                example: ^/roll 1d6^`
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "roll") return;

        if (!args[0])
            return reply({
                type: 'text',
                text: 'You can\'t roll the air, give me something! (example: /roll 1d6)'
            });

        const n = Number(args[0].split('d')[0]);
        const m = Number(args[0].split('d')[1]);
        if (isNaN(n) || isNaN(m))
            return reply({
                type: 'text',
                text: 'I need some numbers (example: /roll 1d6)'
            });

        let result = 0;
        for (let i = 0; i < n; i++)
            result += Math.floor(Math.random() * m) + 1;

        reply({type: 'text', text: result});
    }
}
