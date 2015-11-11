/*
    DESCRIPTION: 
        Get an audio reading aloud whatever you want
        You can also specify the language for the reader voice.

        Example of available languages - it, es, fr, de, ru, en

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !tts <query> [- <language>]

    EXAMPLE:
        You: !tts Hello
        Bot: <audio> saying "Hello" in the default language

        You: !tts Hola - es
        Bot <audio> saying "Hola" in spanish language/accent
*/

var fs = require('fs');
var http = require('http');
var request = require('request');

var crypto = require('crypto');

var util = require('./../util');


var tts = function(){

    defaultLanguage = "en";

    this.init = function(){
        console.log("Here");
    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
    
        var args = util.parseCommand(msg.text,["tts","speak"], {splitBy: "-"});  
            console.log("Here");
        
        if(args){
            console.log("Here");
            reply({type:"status", status: "upload_audio"});
            
            text = args[1];

            language = args[2] ? args[2] : defaultLanguage;

            console.log("\tTTS: '" + text + "'/" + language + " from " + msg.from.username);

            if(text.length == 0)
                return;

            if(encodeURIComponent(text.length) > 150){
                reply({type: 'text', text: "!tts: Text is too long!."});
                return;
            }

            var current_date = (new Date()).valueOf().toString();
            var random = Math.random().toString();
            var fn = __dirname + "/../files/tmp/" + crypto.createHash('sha1').update(current_date + random).digest('hex') + ".mp3";
        

            var url = "http://translate.google.com/translate_tts?tl=" + language + "&q=" + encodeURIComponent(text) + "&client=t";
            
            var headers = { "Host": "translate.google.com",
                "Referer": "http://www.gstatic.com/translate/sound_player2.swf",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.163 Safari/535.19"
            };

            var options = {
                url: url,
                headers: {
                    'Referer': 'http://translate.google.com/',
                    'User-Agent': 'stagefright/1.2 (Linux;Android 5.0)'
                }
            };

            request(options).pipe(fs.createWriteStream(fn)).on('close', function(){
                reply({type: 'audio', audio: fn});
            });

            return;
        }
    };

};

module.exports = tts;