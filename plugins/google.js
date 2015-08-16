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
var util = require('./../util');

var google = function(){

    var GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ""

    this.check = function(){
        return GOOGLE_API_KEY == "" ? false : true;
    };

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){

        var args = util.parseCommand(msg.text,["google","g"], {joinParams: true});

        if(args != null){

            query = args[1]

            if(query.length > 0){

                reply({type:"status", status: "typing"});

                console.log("\tGoogle: " + query);
                link = "http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=" + encodeURIComponent(query) + "&key=" + GOOGLE_API_KEY;
                
                request(link, function (error, response, data) {
                    if (!error && response.statusCode == 200) {
                        
                        data = JSON.parse(data);
                        
                        if(data["responseData"])
                        {
                            if(data["responseData"]["results"])
                            {
                                var result = data["responseData"]["results"][0];
                                
                                title = result["titleNoFormatting"];
                                link = result["url"];
                               

                                if(title && link)
                                    reply({type:"text", text: title + " - " + link})       
                            }
                        }
                    }
                });

                
            }
        }
    };

};

module.exports = google;