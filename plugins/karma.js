/*
    DESCRIPTION: 
        Give karma points to other users.

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        @username++ //add 1 karma point
        @username-- //remove 1 karma point
        /karmachart //print the karma chart
    EXAMPLE:
        You: @user++
        Bot: @user now has N karma

        
*/
var fs = require('fs');
var util = require('./../util');

var karma = function(){

    karma = {};

    this.init = function(){
        fs.readFile("./files/karma",'utf8', function(err, data) {
            if(err) {    
                if(err.code == 'ENOENT') {
                    karma = {}
                    console.log("\tKarma: file not found. Empty Karma.");
                } else {
                    return console.log(err);
                }
            } else {
                karma = JSON.parse(data);
                console.log("\tKarma: file loaded");
            }
        }); 
    };

    this.doStop = function(done){
        var fs = require('fs');
        fs.writeFile("./files/karma", JSON.stringify(karma), { flags: 'w' }, function(err) {
            if(err) {
                return done(err);
            }
            console.log("\tKarma: file saved");
            return done();
        }); 
    };


    this.doMessage = function (msg, reply){
        var reKarma = /@([a-z0-9-_]+)(\-\-|\+\+)/i; 

        var matchKarma = reKarma.exec(msg.text);  
        
        var matchChart = util.parseCommand(msg.text,["karmachart"]);  

        if(matchKarma){
            uname = matchKarma[1];
            operator = matchKarma[2];
            chat = msg.chat.id;

            if(uname.toLowerCase() == msg.from.username.toLowerCase())
            {
                reply({type: 'text', text: "Hey! You can't give yourself Karma!"});
                return;
            }

            if(!karma[chat])
                karma[chat] = {};

            if(!karma[chat][uname])
                karma[chat][uname] = 0;

            if(operator == "--")
                karma[chat][uname]--;
            else
                karma[chat][uname]++;

            reply({type: 'text', text: "@" + uname + " now has " + karma[chat][uname] + " Karma points"});
        }
    };

};

module.exports = karma;