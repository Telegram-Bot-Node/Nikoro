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

var tts = function(){

    defaultLanguage = "en";

    this.init = function(){

    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
    
        var re = /!tts\s+(.*)/i; 
        var match = re.exec(msg.text);  
        
        if(match){

            reply({type:"status", status: "upload_audio"});
            match = match[1].split("-");

            text = match[0].trim();
            language = match[1] ? match[1].trim() : defaultLanguage;

            console.log("\tTTS: '" + text + "' from " + msg.from.username);

            if(text.length == 0)
                return;

            if(encodeURIComponent(text.length) > 150){
                reply({type: 'text', text: "!tts: Text is too long!."});
                return;
            }

            var current_date = (new Date()).valueOf().toString();
            var random = Math.random().toString();
            var fn = __dirname + "/../tmp/" + crypto.createHash('sha1').update(current_date + random).digest('hex') + ".mp3";
        

            var url = "http://translate.google.com/translate_tts?tl=" + language + "&q=" + encodeURIComponent(text);
            request.get(url).pipe(fs.createWriteStream(fn)).on('close', function(){
                reply({type: 'audio', audio: fn});
            });
            return;
        }
    };

};

module.exports = tts;