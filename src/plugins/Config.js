import Plugin from "./../Plugin";
import Util from "./../Util";
import Rebridge from "rebridge";

var db = new Rebridge();

export default class Config extends Plugin {

    get plugin() {
        return {
            name: "Config",
            description: "Configuration manager",
            help: "Syntax: /config (get|set) Plugin foo.bar [JSON value]"
        };
    }

    onText(message, reply) {
        var parts = Util.parseCommand(message.text, "config");
        if (!parts) return;
        if (!parts[2]) return reply({
            type: "text",
            text: "Syntax: /config (get|set) Plugin foo.bar [JSON value]"
        });
        const pluginName = parts[2];
        let config;
        /* eslint-disable no-case-declarations */
        switch (parts[1]) {
        case "get":
            config = JSON.parse(JSON.stringify(db["plugin_" + pluginName].config));
            if (parts[3])
                config = parts[3].split('.').reduce((x, d) => x[d], config);
            reply({
                type: 'text',
                text: JSON.stringify(config)
            });
            return;
        case "set":
            let value;
            try {
                value = JSON.parse(parts.splice(4).join(' '));
            } catch (e) {
                return reply({
                    type: "text",
                    text: "Unable to parse the JSON value."
                });
            }
            config = JSON.parse(JSON.stringify(db["plugin_" + pluginName].config));
            editTree(config, parts[3].split('.'), value);
            db["plugin_" + pluginName].config = config;
            return reply({type: "text", text: "Done."});
        default:
            reply({type: 'text', text: "Unknown command"});
        }
    }
}

function editTree(tree, path, newValue) {
    if (path.length === 0) return newValue;
    let key = path.shift();
    if (tree[key])
        tree[key] = editTree(tree[key], path, newValue);
    else
        tree[key] = newValue;
    return tree;
}