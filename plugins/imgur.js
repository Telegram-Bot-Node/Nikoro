/*
Get a random image from imgur

!imgur  
*/
var sizeOf = require('image-size');
var fs = require('fs');
var http = require('http');
var request = require('request');
var crypto = require('crypto');

var imgur = function(){

    this.init = function(){

    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
        var re = /!imgur\s*/i;
        var match = re.exec(msg.text);  
        
        if(match)
        {  
            findValidPic(0, reply);
        }
    };

    findValidPic = function(s, reply){
        if(s > 50)
            return null;

        reply({type:"status", status: "upload_photo"});

        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var fn = __dirname + "/../tmp/" + crypto.createHash('sha1').update(current_date + random).digest('hex') + ".png";

        generateUrl(5, function(url){
            request.get(url).pipe(fs.createWriteStream(fn)).on('close', function(){
                sizeOf(fn, function (err, dimensions){
                    if(!dimensions)
                    {
                        console.log("\tIMGUR: Wrong id " + s);
                        return findValidPic(++s, reply);
                    }
                    else if(dimensions.width<25 || dimensions.height<25)
                    {
                        console.log("\tIMGUR: Wrong id " + s);
                        return findValidPic(++s, reply);
                    }
                    else if((dimensions.width==198 && dimensions.height==160) || (dimensions.width==161 && dimensions.height==81)) 
                    {
                        console.log("\tIMGUR: Wrong id " + s);
                        return findValidPic(++s, reply);
                    }
                    else
                    {
                        console.log("\tIMGUR: Valid id " + url);
                        reply({type: 'photo', photo: fn});
                    }
                });
            });
        });

        return null;
    };

    generateUrl = function(len, callback){
        var url="";
        len = 5;
        var letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
        for(var i=0;i<len;i++)
        {
            url+=letters[Math.floor(Math.random()*letters.length)];
        }
        callback("http://i.imgur.com/"+url+"m.gif");
    }

};

module.exports = imgur;