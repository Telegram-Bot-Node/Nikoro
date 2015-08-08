/*
    DESCRIPTION: 
        Tweet something!

    AUTHOR: 
        Cristian Baldi

    CONFIGURATION:
        Head over to https://apps.twitter.com/
        Click "Create new app"
        Fill out the form
        Click "Create App"
        Click on the "Keys and access Access Tokens tab"
        Click "Generate Access Token"
        TWITTER_CONSUMER_KEY 
        TWITTER_CONSUMER_SECRET
        TWITTER_ACCESS_TOKEN_KEY
        TWITTER_ACCESS_TOKEN_SECRET
        
    COMMANDS:
        !t <tweet>

    EXAMPLE:
        You: !g <query>
        Bot: title - link
*/


var Twitter = require('twitter');

var twitter = function(){

    var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || "";
    var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || "";
    var TWITTER_ACCESS_TOKEN_KEY = process.env.TWITTER_ACCESS_TOKEN_KEY || "";
    var TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET || "";

    this.check = function(){
        if(TWITTER_CONSUMER_KEY == "")
            return false;
        if(TWITTER_CONSUMER_SECRET == "")
            return false;
        if(TWITTER_ACCESS_TOKEN_KEY == "")
            return false;
        if(TWITTER_ACCESS_TOKEN_SECRET == "")
            return false;

        return true;
    };

    this.init = function(){
        client = new Twitter({
          consumer_key: TWITTER_CONSUMER_KEY,
          consumer_secret: TWITTER_CONSUMER_SECRET,
          access_token_key: TWITTER_ACCESS_TOKEN_KEY,
          access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
        });
    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
        var re = /!tweet\s+(.*)/i; 
        var match = re.exec(msg.text);  
        
        if(match){ 
            reply({type:"status", status: "typing"});
            
            tweet = match[1].trim(); 


            if(tweet.length > 140)
            {
                reply({type:"text", text: "Tweet too long!"});
                return;
            }

            console.log("\tTWITTER: " + tweet);

            client.post('statuses/update', {status: tweet}, function(error, tweet, response){
                if (error) {
                    reply({type:"text", text: "Error tweeting!"});
                }
                reply({type:"text", text: "https://twitter.com/BottanaBot/status/" + tweet.id_str});
            });
        }
    };

};

module.exports = twitter;