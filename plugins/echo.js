var Util = require('./../src/Util');

var echo = function(){

    this.properties = {
        shortDescription: "Echo. What else?",
        fullHelp: "Use `/echo <message>` to make the bot echo `<message>`."
    };

    this.on("text", function (msg, reply){
        var matchEcho = Util.parseCommand(msg.text,["echo"], { joinParams: true });  


        if (matchEcho)
            if(matchEcho[1])
                reply({type: 'text', text: matchEcho[1]}); 
    });

};

module.exports = echo;