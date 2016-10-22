import winston from "winston";
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));

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
