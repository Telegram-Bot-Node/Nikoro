var Util = require('./../src/Util');

var vote = function(){

    this.properties = {
        shortDescription: "A simple vote plugin.",
        fullHelp: "`/vote <option>` to vote for an option\n`/clearvote` to clear the current vote\n`/setvote <topic>` to set the current topic for the vote\n`\getvote` or `\voteresults` to get info and results about the current vote.",
        databaseAccess: true
    };

    this.on("text", function (msg, reply){
        
        var matchVote = Util.parseCommand(msg.text,["vote", "v"], { joinParams: true });  
        var matchClearVote = Util.parseCommand(msg.text,["clearvote", "cv"]);
        var matchSetVote = Util.parseCommand(msg.text,["setvote", "sv"], { joinParams: true });
        var matchGetVote = Util.parseCommand(msg.text,["getvote", "voteresults", "vr"], { joinParams: true });

        chat = msg.chat.id;
        var self = this;

        if(matchVote){
            option = matchVote[1];
            if (!option)
                return;

            uname = msg.from.username;

            if(!uname)
                return;

            self.db.set(chat + ":vote:" + uname, option, function (err) {
                reply({type: 'text', text: "Your vote has been registered.", options: { reply_to_message: msg }});
            });
        }
        else if(matchClearVote){
            self.db.del(chat+":question", function (err) {
                self.db.delKeys(chat+":vote:*", function (err) {
                    reply({type: 'text', text: "Current vote has been cleared.", options: { reply_to_message: msg }});
                });
            });
        }
        else if(matchSetVote){
            option = matchSetVote[1];
            if (!option)
                return;

            self.db.set(chat + ":question", option, function (err) {
                reply({type: 'text', text: "Vote topic set.", options: { reply_to_message: msg }});
            });
        }
        else if(matchGetVote){
            self.db.keys(chat + ":vote:*", function(err, keys){
                var originalKeys = keys.slice();

                if(originalKeys.length == 0) //1 is the question
                {
                    reply({type: 'text', text: "No votes registered."});
                    return;
                }

                self.db.get(chat + ":question", function (err, question) {         

                    message = "Vote Results\n";
                    message += "Question: " + (question ? question : "No question set") + "\n"; 

                    for (var i = 0; i < originalKeys.length; i++) {

                        (function(k) {
                            self.db.get(k, function(err, v){
                                message+= "\n" + k.replace(chat + ":vote:","") + ": " + v;
                                keys.splice(0, 1); // classic hack for async for
                                if (keys.length == 0) {
                                    reply({type: 'text', text: message});
                                }
                            });
                        })(originalKeys[i]);
                        
                    }
                });
            });
        }
    });

};

module.exports = vote;