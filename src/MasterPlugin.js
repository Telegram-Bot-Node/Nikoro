import Plugin from "./Plugin";


export default class MasterPlugin extends Plugin {

    plugin = {
        name: "MasterPlugin",
        description: "",
        help: "This plugin has access to PluginManager and will perform all the 'meta'/'super' actions.",

        type: this.Type.SPECIAL,
        visibility: this.Visibility.HIDDEN,

        needs : {
            database : true,
            utils: true
        }
    };

    constructor(pluginManager) {
        super();

        this.pluginManager = pluginManager;
    }

    onText(message, reply){
        /*if (message.text == "/addping"){
            this.pluginManager.loadAndAdd("Ping")
            reply({type: "text", text: "`Ping` loaded"});
        }*/
    }
}