/*
Search YouTube
!yt <query>

You must obtain an api key for YoutubeData: https://developers.google.com/youtube/v3/getting-started
And then set apiKey.

Example:

You: !yt test
Bot: title - youtube_link
*/

var request = require('request');

var yt = function(){

    apiKey = "";

    this.init = function(){
        if(apiKey.length == 0)
            console.log("YT: Error, apiKey not set.");
    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {

        if(apiKey.length == 0)
            return;

        var re = /!yt\s+(.*)/i; 
        var match = re.exec(msg.text);  
        
        if(match){ 
            query = match[1].trim();

            if(query.length > 0){
                console.log("\tYT: " + query);
                link = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + encodeURIComponent(query) + "&key=" + apiKey;
                
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
                                reply({type:"text", text: videoTitle + " - " + "http://www.youtube.com/watch?v=" + videoId})       
                        }
                    }
                });

                
            }
        }
    };

};

module.exports = yt;