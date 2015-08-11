/*
    DESCRIPTION: 
        Get a random number between 0 and max (default 100)

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !roll [max]

    EXAMPLE:
        You: !roll
        Bot: 4
*/

var roll = function(){

    maxDefault = 100;

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        var re = /!roll\s*(\d+)?/;
        var match = re.exec(msg.text);  
        
        if(match)
        {
            console.log("\tROLL: " + msg.text)

            if(match[1]){ //roll with max specified
                max = parseInt(match[1]); 
            }else{
                max = maxDefault;
            }

            rr = Math.floor(Math.random() * (max+1));

            reply({type: 'text', text: '' + rr });
        }
    };

};

module.exports = roll;