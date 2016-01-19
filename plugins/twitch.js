var Util = require('./../src/util');
var request = require('request');

var twitch = function(){

    this.properties = {
        inline: true,
        onlyInline: true,
        shortDescription: "Spam Twitch Emotes.",
        fullHelp: "Only available inline.\n`twitch <emote>`"
    };

    var emotesData = [];
    var emotesUrl = "";

    this.on("init", function (done){
        url = "https://twitchemotes.com/api_cache/v2/global.json";
        var self = this;
        request(url, function(error, response, data) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(data);
                
                emotesData = data.emotes;
                emotesUrl = data.template.medium;

                return done(null, self);
            }
            else
                return done(error, null);
        });
    });

    this.on("inline_query", function (query, reply){
        var matchTW = Util.parseInline(query.query,["twitch","tw"]);
        if(matchTW)
        {   
            if(matchTW[1]){
                emoteSearch = matchTW[1];
                keys = Object.keys(emotesData);

                found = 0;
                results = [];
                for(i in keys)
                {
                    emote = keys[i];

                    if(Util.startsWith(emote.toLowerCase(),emoteSearch.toLowerCase()))
                    {
                        found++;
                        emoteUrl = "http:" + emotesUrl.replace("{image_id}", emotesData[emote].image_id)
                        results.push({
                            id: emote,
                            photo_url: emoteUrl,
                            thumb_url: emoteUrl,
                            photo_width: 128,
                            photo_height: 128,
                            title: emote,
                            description: emote,
                            type: "photo"
                        });
                    }
                    if(found>=50)
                        break;
                }
                reply(results);
            }
        }
    });

};

module.exports = twitch;