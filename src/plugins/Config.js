const Plugin = require("./../Plugin");

function editTree(tree, path, newValue) {
    if (path.length === 0) return newValue;
    const key = path.shift();
    if (tree[key])
        tree[key] = editTree(tree[key], path, newValue);
    else
        tree[key] = newValue;
    return tree;
}

module.exports = class Config extends Plugin {
    static get plugin() {
        return {
            name: "Config",
            description: "Configuration manager",
            help: "Syntax: /config (get|set) Plugin foo.bar [JSON value]"
        };
    }

    get commands() {
        return {
            config: ({args: [type, pluginName, property, ...jsonValue]}) => {
                if (!type) return "Syntax: /config (get|set) Plugin foo.bar [JSON value]";

                let jsonValueString;
                if (jsonValue)
                    jsonValueString = jsonValue.join(" ");

                let config;
                /* eslint-disable no-case-declarations */
                switch (type) {
                    case "get":
                        config = JSON.parse(JSON.stringify(this.db["plugin_" + pluginName].config));
                        if (jsonValueString)
                            config = property.split(".").reduce((x, d) => x[d], config);
                        return JSON.stringify(config);
                    case "set":
                        let value;
                        try {
                            value = JSON.parse(jsonValueString);
                        } catch (e) {
                            return "Couldn't parse the JSON value.";
                        }
                        config = JSON.parse(JSON.stringify(this.db["plugin_" + pluginName].config));
                        editTree(config, property.split("."), value);
                        this.db["plugin_" + pluginName].config = config;
                        return "Done.";
                    default:
                        return "Unknown command";
                }
            }
        };
    }
};