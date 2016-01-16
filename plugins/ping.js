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

    this.properties = {
        shortDescription: "Ping - Pong",
        fullHelp: "Send `ping`, get `pong`\nIf only life was _this_ easy."
    };

    this.on("text", function (msg, reply){
        if (msg.text.toLowerCase() == "ping"){
            this.log.info("I got a ping"); 
            reply({type: 'text', text: 'pong'});
        }
    });

};

module.exports = ping;