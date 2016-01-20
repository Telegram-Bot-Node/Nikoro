var winston = require("winston");
var config = require("./../config");

function get(loggerName, level) {
    if(!level)
        level = config.loggingLevel || "info";

    /*if (loggerName in loggers){
        return winston.loggers.get(loggerName);
    }else{
        loggers.push(loggerName);*/
    return winston.loggers.add(loggerName, {
        console: {
            level: level,
            colorize: true,
            label: loggerName
        }
    });
    //}
}

module.exports = {
    get: get
};
