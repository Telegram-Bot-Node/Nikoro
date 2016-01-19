/*
    DESCRIPTION: 
        Search xvideos

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        /xvideos <query>

    EXAMPLE:
        You: /xvideos test
        You: title - link
*/

var cheerio = require('cheerio'), request = require('request');
var Util = require('./../src/util');

var xvideos = function(){


    this.properties = {
        shortDescription: "Search xvideos",
        fullHelp: "`/xxx <query>` or`/xvideos <query>`\n\n( ͡° ͜ʖ ͡°)"
    };

    this.on("text", function(msg, reply){

        var match = Util.parseCommand(msg.text,["xxx","xvideos"], {joinParams: true});  

        if(match){ 
            reply({type:"status", status: "typing"});
            
            query = match[1];

            if(query.length > 0){
                console.log("\tXVIDEOS: " + query);
                link = "http://www.xvideos.com/?k=" + encodeURIComponent(query);
                
                request(link, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(html);
                            var title = $($('#profilesList .thumbInside p a')[0]).attr('title');
                            var link = "http://www.xvideos.com" + $($('#profilesList .thumbInside p a')[0]).attr("href");
                            if(title && link){
                                reply({type:"text", text: "[" + title + "](" + link + ")", options: {parse_mode: "Markdown"}});
                            }
                        }
                    }
                });

                
            }
        }
    });

};

module.exports = xvideos;