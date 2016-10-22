import Plugin from "./../Plugin";

export default class Config extends Plugin {

    static get plugin() {
        return {
            name: "Config",
            description: "Configuration manager",
            help: "Syntax: /config (get|set) Plugin foo.bar [JSON value]"
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "config") return;

        let type;
        let pluginName;
        let property;
        let jsonValue;
        [type, pluginName, property, ...jsonValue] = args;
        if (jsonValue) jsonValue = jsonValue.join(" ");

        if (!type) return reply({
            type: "text",
            text: "Syntax: /config (get|set) Plugin foo.bar [JSON value]"
        });

        let config;
        /* eslint-disable no-case-declarations */
        switch (type) {
        case "get":
            config = JSON.parse(JSON.stringify(this.db["plugin_" + pluginName].config));
            if (jsonValue)
                config = property.split('.').reduce((x, d) => x[d], config);
            reply({
                type: 'text',
                text: JSON.stringify(config)
            });
            return;
        case "set":
            let value;
            try {
                value = JSON.parse(jsonValue);
            } catch (e) {
                return reply({
                    type: "text",
                    text: "Couldn't parse the JSON value."
                });
            }
            config = JSON.parse(JSON.stringify(this.db["plugin_" + pluginName].config));
            editTree(config, property.split('.'), value);
            this.db["plugin_" + pluginName].config = config;
            return reply({type: "text", text: "Done."});
        default:
            reply({type: 'text', text: "Unknown command"});
        }
    }
}

function editTree(tree, path, newValue) {
    if (path.length === 0) return newValue;
    const key = path.shift();
    if (tree[key])
        tree[key] = editTree(tree[key], path, newValue);
    else
        tree[key] = newValue;
    return tree;
}