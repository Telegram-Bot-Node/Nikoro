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
var util = require('./../util');
var fs = require('fs');

var quote = function(){

    quotes = [];

    this.init = function(){
        fs.readFile("./files/quotes",'utf8', function(err, data) {
            if(err) {
                return console.log(err);
            }
            quotes = data.toString().split("\n");
            console.log("\tQUOTE: file loaded");
        }); 
    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        var match = util.parseCommand(msg.text,["quote","q"]);  
        
        if(match)
        {
            choice = Math.floor(Math.random() * quotes.length);

            reply({type: 'text', text: quotes[choice] });
        }
    };

};

module.exports = quote;