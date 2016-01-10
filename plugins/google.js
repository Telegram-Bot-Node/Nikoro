/*
    DESCRIPTION: 
        Perform Google searches using Google's Search API

    AUTHOR: 
        Cristian Baldi

    CONFIGURATION:
        Enable Custom Search API
        GOOGLE_API_KEY - https://code.google.com/apis/console/   
            
    COMMANDS:
        !g <query>

    EXAMPLE:
        You: !g <query>
        Bot: title - link
*/

var request = require('request');
var Util = require('./../src/Util');
var _s = require("underscore.string");

var google = function() {

    var GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

    this.properties = {
        inline: true,
        shortDescription: "Search anything on Google.",
        fullHelp: "`/google query` or `/g query` and you are ready to find stuff on the Internet.\nBe careful! It is pretty big!\n\nUse inline with `google <query>`"
    };

    this.check = function() {
        return GOOGLE_API_KEY == "" ? false : true;
    };

    this.on("text", function(msg, reply) {

        var args = Util.parseCommand(msg.text, ["google", "g"], {
            joinParams: true
        });

        if (args != null) {
            query = args[1];

            if (query.length > 0) {

                reply({
                    type: "status",
                    status: "typing"
                });

                this.searchGoogle(query, function(results){

                    var result = results[0];

                    title = _s(result["titleNoFormatting"]).unescapeHTML().value();;
                    link = result["url"];

                    if (title && link) {
                        reply({
                            type: "text",
                            text: "[" + title + "](" + link + ")",
                            options: {
                                parse_mode: "Markdown"
                            }
                        });
                    }
                });
            }
        }
    });


    this.on("inline_query", function(query, reply) {

        var args = Util.parseInline(query.query,["google","g"], { joinParams: true });

        if (args != null) {
            query = args[1];

            if (query.length > 0) {
                this.searchGoogle(query, function(results){

                    if(results)
                    {
                        var answers = [];

                        for(i in results){
                            var title = _s(results[i]["titleNoFormatting"]).unescapeHTML().value();
                            var link = results[i]["url"];


                            answers.push({
                                id: ""+i,
                                type: "article",
                                message_text: "[" + title + "](" + link + ")",
                                parse_mode: "Markdown",
                                title: title,
                                description: link
                            });
                        }
                    
                        reply(answers);
                    }
                });

            }

        }
    });

    this.searchGoogle = function(query, callback) {
        console.log("\tGoogle: " + query);
        link = "http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=" + encodeURIComponent(query) + "&key=" + GOOGLE_API_KEY;

        request(link, function(error, response, data) {
            if (!error && response.statusCode == 200) {

                data = JSON.parse(data);

                if (data["responseData"]) {
                    if (data["responseData"]["results"]) {

                        results = data["responseData"]["results"];

                        for(i in results){
                            results[i]["url"] = decodeURIComponent(results[i]["url"]).split("(").join("%28").split(")").join("%29");
                        }

                        callback(results);
                    }
                }
            }
        });
    }

};

module.exports = google;