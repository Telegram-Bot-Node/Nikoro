var winston = require('winston');

function Loggers(level) {

    winston.loggers.add('plugin', {
        console: {
            level: level,
            colorize: true,
            label: 'PLUGIN'
        }
    });

    winston.loggers.add('bot', {
        console: {
            level: level,
            colorize: true,
            label: 'BOT'
        }
    });

    winston.loggers.add('pluginManager', {
        console: {
            level: level,
            colorize: true,
            label: 'PLMG'
        }
    });

}

module.exports = Loggers;    