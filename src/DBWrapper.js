var redis = require("redis");

var DBWrapper = function (pluginName) {
    this.pluginName = pluginName;
    this.redisdb = redis.createClient();
};

DBWrapper.prototype.set = function(key, value, callback) {
    key = "ntb:"+this.pluginName+":"+key;
    
    this.redisdb.set(key, value, function(){
        if(callback) callback.apply(callback, arguments);
    });
};

DBWrapper.prototype.get = function(key, callback) {
    key = "ntb:"  + this.pluginName + ":"+key;
    this.redisdb.get(key, function() {
        if(callback) callback.apply(callback, arguments);
    });
};

DBWrapper.prototype.incr = function(key, callback) {
    key = "ntb:"  + this.pluginName + ":"+key;
    this.redisdb.incr(key, function() {
        if(callback) callback.apply(callback, arguments);
    });
};

DBWrapper.prototype.decr = function(key, callback) {
    key = "ntb:"  + this.pluginName + ":"+key;
    this.redisdb.decr(key, function() {
        if(callback) callback.apply(callback, arguments);
    });
};

DBWrapper.prototype.del = function(key, callback) {
    key = "ntb:" + this.pluginName + ":"+key;

    this.redisdb.del(key, function() {
        if(callback) callback.apply(callback, arguments);
    });
};

DBWrapper.prototype.keys = function(keyWC, callback) {
    keyWC = "ntb:" + this.pluginName+":" + keyWC;
    self = this;
    this.redisdb.keys(keyWC, function(err, keys) {
        for (var i = 0; i < keys.length; i++) {
            keys[i] = keys[i].replace("ntb:" + self.pluginName+":", "");
        };
        if(callback) callback(err,keys)
    });
};

DBWrapper.prototype.save = function(callback) {
    this.redisdb.bgsave(function() {
        if(callback) callback.apply(callback, arguments);
    });
};

module.exports = DBWrapper;