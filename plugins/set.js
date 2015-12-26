/*
    DESCRIPTION: 
        Trigger bot responses whenever someone says a specific sentence. 
        The triggers will be saved to file on shutdown.

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !set <trigger> - <response>
        !unset <trigger>

    EXAMPLE:
        You: !set hello - f*** you!
        You: hello
        Bot: f*** you!

        You: !unset hello
        You: hello
        Bot: ... <- Nothing, you removed the trigger
*/
var fs = require('fs');
var Util = require('./../src/Util');
var set = function(){

    this.properties = {
        shortDescription: "Trigger bot responses whenever someone says a specific sentence. ",
        fullHelp: "`/set trigger - response` to set a trigger. Whenever a message equal to `trigger` will be sent the bot will answer with `response`.\n`/unset <trigger>` will delete the trigger.",
        databaseAccess: true
    };

    this.on("text", function (msg, reply){
        var matchSet = Util.parseCommand(msg.text,["set"], {splitBy: "-"});  
        var matchUnset = Util.parseCommand(msg.text,["unset"]);  

        if(matchSet){
            key = matchSet[1];
            value = matchSet[2];
            if(!key || !value)
                return;
            chat = msg.chat.id;
            this.db.set(chat+":"+key, value);

            reply({type: 'text', text: "`" + key + "` = `" + value + "`", options:{parse_mode: "Markdown"}})

            console.log("\tSET: " + key + " = " + value + " on " + chat);

        }
        else if(matchUnset)
        {
            key = matchUnset[1];
            chat = msg.chat.id;

            this.db.del(chat+":"+key);
            reply({type: 'text', text: "Unset `" + key + "`", options:{parse_mode: "Markdown"} });
            console.log("\tSET: unset " + key + " on " + chat);

        }
        else
        {
            message = msg.text;
            chat = msg.chat.id;
            var self = this;
            self.db.keys(chat+":*", function(err, keys){
                for(var i=0;i<keys.length;i++)
                {  
                    var key = keys[i].replace(chat + ":","");

                    if(message.indexOf(key) > -1) //lightweight check
                    {
                        var re = new RegExp("(^|\\s+)(" + key + ")(\\s+|$)","gi"); //we really check with regex for word boundaries
                        match = re.exec(message);
                        if(match)
                        {    
                            self.db.get(keys[i], function(err, value){
                                reply({type: 'text', text: value});
                            });
                        }
                    }
                }
            });
            
        }
    });

};

module.exports = set;