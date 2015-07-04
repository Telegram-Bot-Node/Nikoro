/*
The classic 8Ball! 

!8ball [message]

Example:
You: !8ball am i ugly?
Bot: Yes.
*/

var ball = function(){

    //choices = ["Ni.","Sì.","No.","Forse.","Non saprei.","Chiedi più tardi.","Certamente.","Senza dubbio.","Molto probabilmente.","Meglio non dirlo adesso.","Secondo me, sì.","Non posso saperlo.","Io penso di no.","Assolutamente no.","Molto probabilmente no.", "Per me è la C."];
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