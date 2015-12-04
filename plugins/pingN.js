/*
    DESCRIPTION: 
        Ping - pong

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        ping

    EXAMPLE:
        You: ping
        Bot: pong
*/

var pingN = function(){
    
    this.on("text", function (msg, reply){
        if (msg.text.toLowerCase() == "ping")
            reply({type: 'text', text: 'pong'}); 
    });
    
};

module.exports = pingN;