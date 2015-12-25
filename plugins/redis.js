var Util = require('./../src/Util');

var redis = function(){
    
    this.properties = {
    	hidden: true,
    	databaseAccess: true
    };

    this.on("text", function (msg, reply){
    	var self = this;

    	var matchSet = Util.parseCommand(msg.text,["rset"]);
    	var matchGet = Util.parseCommand(msg.text,["rget"]);

    	if(matchSet)
	    	self.db.set(matchSet[1], matchSet[2]);

	    if(matchGet)
	    	self.db.get(matchGet[1],function(err, value){
	    		console.log(value);
	    	});
    });

};

module.exports = redis;