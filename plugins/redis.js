var Util = require('./../src/util');

var redis = function(){
    
    this.properties = {
        hidden: true,
        databaseAccess: true
    };

    this.on("text", function (msg, reply){
        var self = this;

        var matchSet = Util.parseCommand(msg.text,["rset"]);
        var matchGet = Util.parseCommand(msg.text,["rget"]);
        var matchDel = Util.parseCommand(msg.text,["rdel"]);
        var matchKeys = Util.parseCommand(msg.text,["rkeys"]);

        if(matchSet)
            self.db.set(matchSet[1], matchSet[2]);

        if(matchGet)
            self.db.get(matchGet[1],function(err, value){
                console.log(value);
            });

        if(matchDel)
            self.db.del(matchDel[1],function(err, value){
                console.log(value);
            });

        if(matchKeys)
            self.db.keys(matchKeys[1],function(err, keys){
                console.log(keys);
            });
    });

};

module.exports = redis;