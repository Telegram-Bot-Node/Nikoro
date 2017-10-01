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

    get commands() {
        return {
            calc: ({args}) => mathjs.eval(args.join(" ")),
            math: ({args}) => mathjs.eval(args.join(" "))
        };
    }
};
