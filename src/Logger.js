import winston from "winston";
import Config from "./../Config";

function get(loggerName, level) {
    if (!level)
        level = Config.loggingLevel || "info";

    if (loggerName in winston.loggers)
        return winston.loggers.get(loggerName);
    else
        return winston.loggers.add(loggerName, {
            console: {
                level,
                colorize: true,
                label: loggerName
            }
        });
}

export default {
    get
};
