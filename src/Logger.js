var winston = require('winston');

var Loggers(level) {

    this.getOrAdd = function (loggerName) {
        winston.loggers.add(loggerName, {
            console: {
                level: level,
                colorize: true,
                label: 'PLUGIN'
            }
        });
    };
}

module.exports.Logger = Logger;    