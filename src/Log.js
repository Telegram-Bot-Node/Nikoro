const winston = require("winston");

module.exports = function Logger(loggername, config, level) {
    if (!level && config) level = config.loggingLevel;
    if (!level) level = "info";
    if (loggername in winston.loggers)
        return winston.loggers.get(loggername);

    return winston.loggers.add(loggername, {
        console: {
            level,
            colorize: true,
            label: loggername
        }
    });
};
