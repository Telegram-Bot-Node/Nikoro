/*
    DESCRIPTION: 
        Get a specific reddit post from r/frontpage

    AUTHOR: 
        Phill Farrugia

    COMMANDS:
        [reddit, !reddit, /reddit] <1-25>

    EXAMPLE:
        You: reddit 1
        Bot: r/pics - An Amazonian girl and her pet sloth 
        http://reddit.com/r/pics/comments/3hxg1e/an_amazonian_girl_and_her_pet_sloth/
*/

var request = require('request');
var Util = require('./../src/Util');

var reddit = function() {
    
    this.help = {
        shortDescription: "Get a specific reddit post from r/frontpage",
        fullHelp: "`/reddit n` will get the `n`th post on the Front Page of Reddit."
    };

    this.on("text", function (msg, reply){
        var args = Util.parseCommand(msg.text,["reddit","frontpage"]); 

        if (args) {
            reply({ type: "status", status: "typing" });
            query = parseInt(args[1]);
            query--; // subtract 1 due to 0 indexing

            if (query > -1) {
                url = "https://www.reddit.com/.json";
                request(url, function(error, response, data) {
                    if (!error && response.statusCode == 200) {
                        data = JSON.parse(data);
                        var results = data["data"]["children"];
                        if (results.length > query) {
                            var post = results[query]["data"];
                            var permalink = post["permalink"];
                            var title = post["title"];
                            var subreddit = post["subreddit"];
                            var msg = "r/" + subreddit + " - [" + title + "](http://reddit.com" + permalink + ")";
                            reply({ type: "text", text: msg, options:{parse_mode: "Markdown"}});
                        }
                    } else {
                        reply({ type: "text", text: "Oops! Try again later" });
                    }
                })
            }
        }
    });
}

module.exports = reddit;
