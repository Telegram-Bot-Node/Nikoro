var request = require('request');
var Util = require('./../src/Util');

var boobsbutts = function() {
    
    var MAX_PER_COMMAND = 10;

    this.properties = {
        inline: true,
        shortDescription: "Get boobs and butts.\n\n*Warning: Adult Content*",
        fullHelp: "Just type `/boobs [howMany]` or `/butts [howMany]`. `[howMany]` is optional and it will cap to " + MAX_PER_COMMAND
    };

    this.on("text", function (msg, reply){
        var matchBoobs = Util.parseCommand(msg.text,["boobs"]); 
        var matchButts = Util.parseCommand(msg.text,["butts"]); 

        if (matchBoobs || matchButts) {
            var match = matchBoobs || matchButts;
            var howMany = (match[1] || 1);
            howMany = (howMany <= MAX_PER_COMMAND && !isNaN(howMany)) ? howMany : MAX_PER_COMMAND;

            console.log("\tboobsbutts: " + match[0]);

            reply({ type: "status", status: "upload_photo" });
            
            this.getRandom(match[0], function(data){
                
                for(var i=0; i<howMany; i++)
                {
                    Util.downloadAndSaveTempResource(data[i].url, "png", function(fn){
                        reply({ type: "photo", photo: fn });
                    });
                }
            });
        }
    });


    /*this.on("inline_query", function(query, reply) {
        var matchBoobs = Util.parseInline(query.query,["boobs"]); 
        var matchButts = Util.parseInline(query.query,["butts"]); 

        if (matchBoobs || matchButts) {
            var match = matchBoobs || matchButts;

            console.log("\tboobsbutts inline: " + match[0]);

            this.getRandom(match[0], function(results){
                
                var answers = [];

                for(var i=0; i<results.length; i++){

                    answers.push({
                        id: ""+i,
                        type: "photo",
                        photo_url: results[i].url,
                        thumb_url: results[i].url,
                        photo_width: 1000,
                        photo_height: 1000,
                    });
                }
                reply(answers);

            });
        }
    });*/


    this.getRandom = function(what, callback){
        url = "http://api.o" + what + ".ru/noise/" + MAX_PER_COMMAND;

        request(url, function(error, response, data) {
            if (!error && response.statusCode == 200) {
                data = JSON.parse(data);

                for(i in data){
                    data[i].url = "http://media.o" + what + ".ru/" + data[i].preview;
                }
                
                callback(data);
            }
        });
    };
}

module.exports = boobsbutts;
