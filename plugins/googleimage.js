/*
    CONFIGURATION:
        https://github.com/vdemedes/google-images#set-up-google-custom-search-engine
*/

"use strict";

var Util = require('./../src/Util');
var googleImages = require('google-images');

var request = require('request');
var crypto = require('crypto');
var fs = require('fs');

var Config = require('./../config');

var google = function() {

    var CSE_ID = Config.CSE_ID || "";
    var CSE_API_KEY = Config.CSE_API_KEY || "";

    this.properties = {
        inline: true,
        shortDescription: "Find images via Google",
        fullHelp: "`/gi query` or `/image query` to find images via Google Images. Use inline with `image <query>`"
    };

    this.check = function() {
        console.log(CSE_API_KEY);
        console.log(CSE_API_KEY == "" ? false : true);
        return (CSE_ID == "" ? false : true) &&  (CSE_API_KEY == "" ? false : true);
    };

    this.on("init", function(callback){
        this.giClient = googleImages(CSE_ID, CSE_API_KEY);

        callback(null, this);
    });

    this.on("text", function(msg, reply) {

        var query = Util.parseCommand(msg.text, ["gi", "image"], {
            joinParams: true
        });

        if (query != null) {
            var imageToFind = query[1];

            if(imageToFind){
                reply({
                    type: "status",
                    status: "upload_photo"
                });

                console.log("Google Image:" + imageToFind);

                this.giClient.search(imageToFind).then(function(results){

                    var result = results[0];
                    var url = result["url"];

                    Util.downloadAndSaveTempResource(url, "png", function(fn){
                        reply({type: 'photo', photo: fn});
                    });

                });
            }
        }
    });


    this.on("inline_query", function(query, reply) {
        var args = Util.parseInline(query.query,["gi","image"], { joinParams: true });

        if (args != null) {
            query = args[1];

            if(query)
            {
                console.log("Google Image inline:" + query);


                this.giClient.search(query).then(function(results){


                    if(results)
                    {
                        var answers = [];

                        for(var i=0; i<results.length; i++){

                            answers.push({
                                id: ""+i,
                                type: "photo",
                                photo_url: results[i].url,
                                thumb_url: results[i].thumbnail.url,
                                photo_width: results[i].width,
                                photo_height: results[i].height,
                            });
                        }
                        reply(answers);
                    }
                });
            }
        }
    });
};

module.exports = google;