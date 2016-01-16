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

DBWrapper.prototype.getMe = function(key, callback) {
    key = "ntb:telegram-me:username";
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
    keyWC = keyWC.replace(/[\?\[\]\^\*\-]/g,"\\$&");
    keyWC = "ntb:" + this.pluginName+":" + keyWC;
    var self = this;
    this.redisdb.keys(keyWC, function(err, keys) {
        for (var i = 0; i < keys.length; i++) {
            keys[i] = keys[i].replace("ntb:" + self.pluginName+":", "");
        };
        if(callback) callback(err,keys)
    });
};

DBWrapper.prototype.delKeys = function(keyWC, callback) {
    keyWC = keyWC.replace(/[\?\[\]\^\*\-]/g,"\\$&");
    keyWC = "ntb:" + this.pluginName+":" + keyWC;
    var self = this;
    self.redisdb.keys(keyWC, function(err, keys) {
        var _keys = keys.slice();
        var _args = arguments.slice();
        for (var i = 0; i < keys.length; i++) {
            (function(key) {
                self.redisdb.del(key, function(){
                    _keys.splice(0,1);
                    if(_keys.length == 0 && callback)
                        callback.apply(callback, _args);
                });
            })(keys[i]);
        };
    });
};

DBWrapper.prototype.flushall = function(callback) {
    keyWC = "ntb:" + this.pluginName+":*";
    var self = this;
    self.redisdb.keys(keyWC, function(err, keys) {
        var _keys = keys.slice();
        var _args = arguments.slice();
        for (var i = 0; i < keys.length; i++) {
            (function(key) {
                self.redisdb.del(key, function(){
                    _keys.splice(0,1);
                    if(_keys.length == 0 && callback)
                        callback.apply(callback, _args);
                });
            })(keys[i]);
        };
    });
};

DBWrapper.prototype.save = function(callback) {
    this.redisdb.bgsave(function() {
        if(callback) callback.apply(callback, arguments);
    });
};

module.exports = DBWrapper;