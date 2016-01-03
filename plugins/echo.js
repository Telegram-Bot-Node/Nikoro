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
            {
                text = matchEcho[1];
                if(Util.startsWith(text,"!") || Util.startsWith(text,"/"))
                    reply({type: 'text', text: "I am not echoing that.", options: { reply_to_message_id: msg.message_id }}); 
                else 
                    reply({type: 'text', text: matchEcho[1]}); 
            }
    });

};

module.exports = echo;