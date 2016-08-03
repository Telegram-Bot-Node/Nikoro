import winston from "winston";
import Config from "./../Config";

function get(loggername, level = Config.loggingLevel || "info") {
    if (loggername in winston.loggers)
        return winston.loggers.get(loggername);

    return winston.loggers.add(loggername, {
        console: {
            level,
            colorize: true,
            label: loggername
        }
    });
}

export default {
    get
};
