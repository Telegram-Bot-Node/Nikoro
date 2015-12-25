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
var Util = require('./../src/Util');
var fs = require('fs');

var quote = function(){

    this.properties = {
        shortDescription: "Get a random quote from the `quotes` file.",
        fullHelp: "`/quote` is all you need to have fun."
    };

    quotes = [];

    this.on("init", function (done){
        var self = this;

        fs.readFile("./files/quotes",'utf8', function(err, data) {
            if(err) {
                return done(err, null);
            }
            quotes = data.toString().split("\n");
            console.log("\tQUOTE: file loaded");
            return done(null, self);
        }); 
    });

    
    this.on("text", function (msg, reply){
        var match = Util.parseCommand(msg.text,["quote","q"]);  
        
        if(match)
        {
            choice = Math.floor(Math.random() * quotes.length);

            reply({type: 'text', text: "`" + quotes[choice] + "`", options:{parse_mode: "Markdown"}});
        }
    });

};

module.exports = quote;