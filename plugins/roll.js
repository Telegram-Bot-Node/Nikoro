/*
    DESCRIPTION: 
        Get a random number between 0 and max (default 100)

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !roll [max]

    EXAMPLE:
        You: !roll
        Bot: 4
*/
var Util = require('./../src/util');

var roll = function(){

    MAX_DEFAULT = 100;

    this.properties = {
        shortDescription: "Random Number Generator.",
        fullHelp: "`/roll` to generate a number from 1 to " + MAX_DEFAULT + ".\n`/roll max` to generate a number from 1 to `max`"
    };


    this.on("text", function (msg, reply){
        var args = Util.parseCommand(msg.text,["roll","r"]);  

        if(args)
        {
            console.log("\tROLL: " + msg.text)

            if(args[1] && !isNaN(args[1])){ //roll with max specified
                max = parseInt(args[1]); 
            }else{
                max = MAX_DEFAULT;
            }

            rr = Math.floor(Math.random() * (max+1));

            reply({type: 'text', text: '' + rr });
        }
    });

};

module.exports = roll;