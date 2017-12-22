const fs = require("fs");
const walk = require("walk-sync");
const inquirer = require("inquirer");

const descriptionsToPathsMap = {};
const pluginQuestions = [];

const questions = [
    {
        type: "input",
        name: "TELEGRAM_TOKEN",
        message: "What's the bot token?",
        validate: token => /\d+:\w+/.test(token) ? true : "Please insert a valid token. You can get one from @BotFather."
    },
    {
        type: "checkbox",
        name: "activePlugins",
        message: "What plugins would you like to enable?",
        // Find every file in the plugins folder.
        choices: walk(`${__dirname}/plugins`)
            // Use only .js files.
            .filter(item => /\.js$/i.test(item))
            .map(path => {
                // Remove the extension.
                path = path.replace(/\.js$/i, "");
                let plugin;

                try {
                    plugin = require(`${__dirname}/plugins/${path}`, false).plugin;
                } catch (e) {
                    let message = e.message;
                    message = message.replace(/^Cannot find module '([^']+)'$/, "Must install \"$1\" first");
                    return {
                        name: ` ${path}.js`,
                        disabled: message
                    };
                }

                const string = " " + plugin.name + (plugin.description ? ` - ${plugin.description}` : "");
                descriptionsToPathsMap[string] = path;

                return {name: string};
            })
    },
    {
        type: "input",
        name: "owners",
        message: "Enter the list of owners as an array of user IDs (eg. [1111, 1234])",
        filter: JSON.parse,
        validate: array => {
            try {
                if (array.every(ID => /\d+/.test(ID)))
                    return true;
            } catch (e) {
            }
            return "Please insert an array of user IDs.";
        }
    },
    ...pluginQuestions,
    {
        type: "list",
        name: "loggingLevel",
        message: "What logging level is to be used?",
        choices: [
            "error",
            "warn",
            "info",
            "verbose",
            "debug"
        ],
        default: "info"
    }
];

const configPath = `${__dirname}/../config.json`;

inquirer.prompt({
    type: "confirm",
    name: "force",
    message: "A configuration file already exists. Would you like to overwrite it?",
    default: false,
    when: function() {
        try {
            JSON.parse(fs.readFileSync(configPath, "utf8"));
            return true;
        } catch (e) {
            return false;
        }
    }
}).then(({force = true}) => {
    if (!force) process.exit(0);
    return inquirer.prompt(questions);
}).then(answers => {
    answers.activePlugins = answers.activePlugins.map(description => descriptionsToPathsMap[description]);
    fs.writeFileSync(configPath, JSON.stringify(answers, null, 4));
    process.exit(0);
});