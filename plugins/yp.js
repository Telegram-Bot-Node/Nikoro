/*
    DESCRIPTION: 
        Search YouPorn

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !yp <query>

    EXAMPLE:
        You: !yp test
        You: title - link
*/

var cheerio = require('cheerio'), request = require('request');
var util = require('./../util');

var yp = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){

        var match = util.parseCommand(msg.text,["yp","youporn"], {joinParams: true});  

        if(match){ 
            reply({type:"status", status: "typing"});
            
            query = match[1];

            if(query.length > 0){
                console.log("\tYP: " + query);
                link = "http://www.youporn.com/search/?query=" + encodeURIComponent(query);
                
                request(link, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(html);
                            var title = $($('.videoBox .videoTitle')[0]).text();
                            var link = "http://www.youporn.com" + $($('.videoBox > div > a')[0]).attr("href");
                            if(title && link){
                                reply({type:"text", text: title + " - " + link})
                            }
                        }
                    }
                });

                
            }
        }
    };

};

module.exports = yp;