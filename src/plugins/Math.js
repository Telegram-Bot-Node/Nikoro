const Plugin = require("./../Plugin");
const mathjs = require("mathjs");

module.exports = class Math extends Plugin {
    static get plugin() {
        return {
            name: "Math",
            description: "Amazing calculator based on [math.js](http://mathjs.org/)",
            help: `Use \`/calc expression\` or \`/math expression\` to get a quick answer for your math expression.
You can use _imagnary numbers_, functions such as _sin_, _cos_ and much, much more.
Check out math.js website for examples of supported stuff.`
        };
    }

    onCommand({message, command, args}) {
        if (command !== 'math' && command !== 'calc') return;
        let result = "";

        try {
            result = 'result ' + mathjs.eval(args.join(' '));
        } catch (e) {
            result = 'invalid input';
        }

        this.sendMessage(message.chat.id, result);
    }
};
