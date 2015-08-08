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

var ball = function(){

    choices = ["Yes.","No.","Maybe.","I don't know yet."];
    
    this.init = function(){

    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
        var re = /!8ball\s+?/i;
        var match = re.exec(msg.text);  
        
        if(match)
        {
            console.log("\t8BALL: " + msg.text)

            choice = Math.floor(Math.random() * choices.length);

            reply({type: 'text', text: choices[choice] });
        }
    };

};

module.exports = ball;