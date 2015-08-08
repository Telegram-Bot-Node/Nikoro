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

var ping = function(){

    this.init = function(){

    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
        if (msg.text.toLowerCase() == "ping")
            reply({type: 'text', text: 'pong'}); 
    };

};

module.exports = ping;