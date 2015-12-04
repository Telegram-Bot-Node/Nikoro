/*
    DESCRIPTION: 
        The classic 8Ball!

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !8ball <question>

    EXAMPLES:
        You: !8ball am i ugly?
        Bot: Yes.
*/
var Util = require('./../src/Util');

var ball = function(){

    this.help = {
        shortDescription: "Magic 8-Ball!",
        fullHelp: "The Magic 8-Ball will give an answer to all your yes-no questions.\n`/8ball question\n/8b question`"
    };

    var choices = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
    
    this.on("text", function (msg, reply){
        var match = Util.parseCommand(msg.text,["8ball","8b"]);  
           
        if(match)
        {
            console.log("\t8BALL: " + msg.text)

            choice = Math.floor(Math.random() * choices.length);

            reply({type: 'text', text: choices[choice] });
        }
    });

};

module.exports = ball;