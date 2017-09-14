const Plugin = require("./../Plugin");

module.exports = class Config extends Plugin {

    static get plugin() {
        return {
            name: "Config",
            description: "Configuration manager",
            help: "Syntax: /config (get|set) Plugin foo.bar [JSON value]"
        };
    }

    onCommand({message, command, args}) {
        if (command !== "config") return;

        const [type, pluginName, property, ...jsonValue] = args;

        let jsonValueString;
        if (jsonValue) {
            jsonValueString = jsonValue.join(" ");
        }

        if (!type)
            return this.sendMessage(message.chat.id, "Syntax: /config (get|set) Plugin foo.bar [JSON value]");

        let config;
        /* eslint-disable no-case-declarations */
        switch (type) {
        case "get":
            config = JSON.parse(JSON.stringify(this.db["plugin_" + pluginName].config));
            if (jsonValueString)
                config = property.split('.').reduce((x, d) => x[d], config);
            this.sendMessage(message.chat.id, JSON.stringify(config));
            return;
        case "set":
            let value;
            try {
                value = JSON.parse(jsonValueString);
            } catch (e) {
                return this.sendMessage(message.chat.id, "Couldn't parse the JSON value.");
            }
            config = JSON.parse(JSON.stringify(this.db["plugin_" + pluginName].config));
            editTree(config, property.split('.'), value);
            this.db["plugin_" + pluginName].config = config;
            return this.sendMessage(message.chat.id, "Done.");
        default:
            this.sendMessage(message.chat.id, "Unknown command");
        }
    }
};

function editTree(tree, path, newValue) {
    if (path.length === 0) return newValue;
    const key = path.shift();
    if (tree[key])
        tree[key] = editTree(tree[key], path, newValue);
    else
        tree[key] = newValue;
    return tree;
}