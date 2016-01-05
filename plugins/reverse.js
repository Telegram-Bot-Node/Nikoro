/*
    DESCRIPTION: 
        Ping - pong

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        ping

    EXAMPLE:
        You: ping
        Bot: pong
*/
var Util = require('./../src/Util');
var s = require("underscore.string");

var reverse = function(){

    this.properties = {
        inline: true,
        shortDescription: "Reverse any text.",
        fullHelp: "Only available inline.\n`reverse <text>`"
    };

    this.on("inline_query", function (query, reply){
        var matchRv = Util.parseInline(query.query,["reverse","rv"], { joinParams: true });
        if(matchRv)
        {   
            if(matchRv[1]){
                revs = s(matchRv[1]).reverse().value();
                var results = [{id:"0", type:'article', message_text: revs, title: revs}];
                reply(results);
            }
        }
    });

};

module.exports = reverse;