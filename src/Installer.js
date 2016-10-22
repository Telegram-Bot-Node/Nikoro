import fs from "fs";
import walk from "walk-sync";
import inquirer from "inquirer";

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
                    plugin = require(`${__dirname}/plugins/${path}`, false).default.plugin;
                } catch (e) {
                    return {
                        name: ` ${path}.js`,
                        disabled: e.message
                    };
                }

                const string = " " + plugin.name + (plugin.description ? ` - ${plugin.description}` : "");
                descriptionsToPathsMap[string] = path;

                if (plugin.needs && plugin.needs.config) {
                    // Iterate through the plugins.needs.config object
                    Object.keys(plugin.needs.config)
                        .map(key => ({
                            name: key,
                            description: plugin.needs.config[key]
                        }))
                        // Map every requirement to an Inquirer.js option
                        .map(item => ({
                            type: "input",
                            name: item.name,
                            message: `${plugin.name} needs: "${item.description}"`,
                            // Ask the question only if:
                            when: answers => (answers.activePlugins.indexOf(string) !== -1) && (Object.keys(answers).indexOf(item.name) === -1)
                            //               /* the plugin is enabled                    */ and/* this parameter hasn't already been asked   */
                        }))
                        // Remove duplicates
                        .filter(item => !pluginQuestions.some(q => q.name === item.name))
                        .forEach(item => pluginQuestions.push(item));
                }

                return {name: string};
            })
    },
    {
        type: "input",
        name: "globalAdmins",
        message: "Enter the list of global admins as an array of user IDs (eg. [1111, 1234])",
        filter: JSON.parse,
        validate: array => {
            try {
                if (array.every(ID => /\d+/.test(ID)))
                    return true;
            } catch (e) {
                console.log(e);
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