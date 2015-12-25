/*
    DESCRIPTION: 
        Amazing calculator based on [math.js]

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        /calc <expression>

    EXAMPLE:
        You: /calc 3+2
        Bot: 6
*/

var Util = require('./../src/Util');
var mathjs = require('mathjs');

var math = function(){

    this.properties = {
        shortDescription: "Amazing calculator based on [math.js](http://mathjs.org/)",
        fullHelp: "Use `/calc expression` or `/math expression` to get a quick answer for your math expression.\nYou can use _imagnary numbers_, fucntions such as _sin_, _cos_ and much, much more.\nCheck out math.js website for examples of supported stuff."

    };

    this.on("text", function (msg, reply){
        
        var match = Util.parseCommand(msg.text,["calc", "math"], {splitBy: ";"});  
        if(match)
        {
            match.splice(0,1);
            results = mathjs.eval(match);
            result = results[results.length-1];
            
            message = "`" + result + "`";
            reply({type:"text", text: message, options: { parse_mode: "Markdown" }});
        }
    });

};

module.exports = math;