const Plugin = require("./../Plugin");
const mathjs = require("mathjs");

module.exports = class Math extends Plugin {
    static get plugin() {
        return {
            name: "Math",
            description: "Amazing calculator based on [math.js](http://mathjs.org/)",
            help: "Use `/calc expression` or `/math expression` to get a quick answer for your math expression. Supports imaginary numbers, sin/cos/tan, and much more!"
        };
    }

    onCommand({command, args}) {
        if (command !== "calc" && command !== "math") return;
        return mathjs.eval(args.join(" "));
    }
};
