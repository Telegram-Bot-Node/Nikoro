/*usage: 
!tts <what> (- <accent>)
google voice will read the message you specified in <what>.

optional "- <accent>"
specify the accent the voice will use, default is "it" for italian, you can edit the source and set it to "en"

!tts bonjour - fr //will post an audio of bonjour read in french
!tts ciao //will post an audio of "ciao" read in italian (default accent, will fix later)*/

var fs = require('fs');
var http = require('http');
var request = require('request');

var crypto = require('crypto');

var tts = function(){

    this.init = function(){

    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
    
        var re = /!tts\s+(.*)/i; 
        var match = re.exec(msg.text);  
        
        if(match){
            match = match[1].split("-");

            text = match[0].trim();
            language = match[1] ? match[1].trim() : "it";

            console.log("\tTTS: '" + text + "' from " + msg.from.username);

            if(text.length == 0)
                return;

            if(encodeURIComponent(text.length) > 150){
                reply({type: 'text', text: "!tts: Testo troppo lungo."});
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