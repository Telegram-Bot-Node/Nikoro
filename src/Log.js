const winston = require("winston");
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));

module.exports.get = (loggername, level = Config.loggingLevel || "info") => {
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
