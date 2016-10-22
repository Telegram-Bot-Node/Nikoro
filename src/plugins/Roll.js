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
        this.log.debug("rolling..")
        if (!args[0]) {
            reply({type: 'text', text: 'you can\'t roll the air, give me something! (example: /roll 1d6)'});
            return;
        }
        
        let n = Number(args[0].split('d')[0]);
        let m = Number(args[0].split('d')[1]);
        if(isNaN(n)|| isNaN(m)) {
            reply({type: 'text', text: 'I need some numbers (example: /roll 1d6)'});
            return;
        }

        let result = 0;
        for (var i = 0; i < n; i++) {
            let dice = Math.floor(Math.random() * m) + 1;
            this.log.debug(`dice number ${i+1} is ${dice}`)
            result += dice

        }
        
        reply({type: 'text', text: result});
    }
}
