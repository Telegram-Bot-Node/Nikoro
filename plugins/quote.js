/*
    DESCRIPTION: 
        Get a random line from the quotes file

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !q

    EXAMPLE:
        You: !q
        Bot: This is Sparta!
*/

var quote = function(){

    quotes = [];

    this.init = function(){
        var fs = require('fs');
        fs.readFile("./files/quotes",'utf8', function(err, data) {
            if(err) {
                return console.log(err);
            }
            quotes = data.toString().split("\n");
            console.log("\tQUOTE: file loaded");
        }); 
    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
        var re = /!q/i;
        var match = re.exec(msg.text);  
        
        if(match)
        {
            choice = Math.floor(Math.random() * quotes.length);

            reply({type: 'text', text: quotes[choice] });
        }
    };

};

module.exports = quote;