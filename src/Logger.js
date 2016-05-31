import winston from "winston";
import Config from "./../Config";

function get(loggerName, level) {
    if(!level)
        level = Config.loggingLevel || "info";

    /*if (loggerName in loggers){
        return winston.loggers.get(loggerName);
    }else{
        loggers.push(loggerName);*/
    return winston.loggers.add(loggerName, {
        console: {
            level,
            colorize: true,
            label: loggerName
        }
    });
    //}
}

export default {
    get
};
