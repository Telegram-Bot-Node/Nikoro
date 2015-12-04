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
var util = require('./../util');
var set = function(){

    this.help = {
        shortDescription: "Trigger bot responses whenever someone says a specific sentence. ",
        fullHelp: "`/set trigger - response` to set a trigger. Whenever a message equal to `trigger` will be sent the bot will answer with `response`.\n`/unset <trigger>` will delete the trigger."
    };

    dict = {};

    this.on("init", function (done){
        var self = this;
        fs.readFile("./files/set",'utf8', function(err, data) {
            if(err) {    
                if(err.code == 'ENOENT') {
                    dict = {}
                    console.log("\tSET: file not found. Empty Set.");
                } else {
                    return done(err, null);
                }
            } else {
                dict = JSON.parse(data);
                console.log("\tSET: file loaded");
            }

            done(null, self);
        }); 
    });

    this.on("stop", function (done){
        fs.writeFile("./files/set", JSON.stringify(dict), { flags: 'w' }, function(err) {
            if(err) {
                return done(err);
            }
            console.log("\tSET: file saved");
            done();
        }); 
    });


    this.on("text", function (msg, reply){
        var matchSet = util.parseCommand(msg.text,["set"], {splitBy: "-"});  
        var matchUnset = util.parseCommand(msg.text,["unset"]);  

        if(matchSet){
            console.log(msg);

            key = matchSet[1];
            value = matchSet[2];
            chat = msg.chat.id;

            if(!dict[chat])
                dict[chat] = {};

            dict[chat][key] = value;

            reply({type: 'text', text: "`" + key + "` = `" + value + "`", options:{parse_mode: "Markdown"}})

            console.log("\tSET: " + key + " = " + value + " on " + chat);

        }
        else if(matchUnset)
        {
            key = matchUnset[1];
            chat = msg.chat.id;

            delete dict[chat][key];
            reply({type: 'text', text: "Unset `" + key + "`", options:{parse_mode: "Markdown"} });
            console.log("\tSET: unset " + key + " on " + chat);

        }
        else
        {
            key = msg.text;
            chat = msg.chat.id;
            if(dict[chat])
            {
                if (key in dict[chat])
                {
                    reply({type: 'text', text: dict[chat][key]});
                }
            }

        }
    });

};

module.exports = set;