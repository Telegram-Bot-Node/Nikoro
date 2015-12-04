/*
    DESCRIPTION: 
        Perform YouTube searches using Youtube's Data API

    AUTHOR: 
        Cristian Baldi

    CONFIGURATION:
        Enable YouTube Data API v3
        GOOGLE_API_KEY - https://code.google.com/apis/console/

    COMMANDS:
        !yt <query>

    EXAMPLE:
        You: !yt test
        Bot: title - link
*/

var request = require('request');
var Util = require('./../src/Util');

var youtube = function(){

    var GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ""

    this.help = {
        shortDescription: "Search for videos on YouTube.",
        fullHelp: "Use `/youtube query` or `/yt query` to seach for `query` on YouTube."
    };

    this.check = function(){
        return GOOGLE_API_KEY == "" ? false : true;
    };

    
    this.on("text", function (msg, reply){

        var match = Util.parseCommand(msg.text,["yt","youtube", "video"], {joinParams: true});  
  
        if(match){ 

            reply({type:"status", status: "typing"});

            query = match[1];

            if(query.length > 0){
                console.log("\tYT: " + query);
                link = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + encodeURIComponent(query) + "&key=" + GOOGLE_API_KEY;
                
                request(link, function (error, response, data) {
                    if (!error && response.statusCode == 200) {
                        
                        data = JSON.parse(data);
                        
                        if(data["items"])
                        {
                            var videos = data["items"];
                            
                            for (i=0,len=videos.length;i<len;i++)
                            {
                                if(videos[i]["id"]["kind"] == "youtube#video")
                                {
                                    videoId = videos[i]["id"]["videoId"];
                                    videoTitle = videos[i]["snippet"]["title"];
                                    break;
                                }
                            }
                            if(videoId && videoTitle)
                                reply({type:"text", text: "[" + videoTitle + "]" + "(" + "http://www.youtube.com/watch?v=" + videoId + ")", options:{parse_mode: "Markdown"}})       
                        }
                    }
                });

                
            }
        }
    });

};

module.exports = youtube;