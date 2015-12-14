/*
    DESCRIPTION: 
        PluginHelper
        This special plugin will manage help command, enable/disable plugin requests and much more that the average plugin-writer should not be concerned of.

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        !help
        !list
        !enable        
        !disable

    EXAMPLE:
        TODO
*/

var Util = require('./Util');

var PluginHelper = function(){

    this.plugins = {};

    this.on("init", function (callback){
        console.log("Initting PluginHelper");
        callback();
    });

    this.on("stop", function (callback){
        console.log("Stopping PluginHelper");
        callback();
    });

    this.on("text", function (msg, reply){

        var matchHelp = Util.parseCommand(msg.text,["help"]);
        var matchList = Util.parseCommand(msg.text,["list"]);

        if(matchHelp)
        {
            plugin = matchHelp[1];
            if(this.plugins[plugin] && !this.plugins[plugin].hidden)
            {   
                help = this.plugins[plugin];
                message = "*" + help.name + "*\n" + "" + help.shortDescription + "\n\n" + help.fullHelp
                reply({type:"text", text: message, options:{parse_mode: "Markdown"} })
            }
            
        } else if (matchList){
            var message = "*Enabled Plugins*\n\n"

            pluginNames = Object.keys(this.plugins)
            console.log(this.plugins);
            for(var i in pluginNames)
            {
                plugin = this.plugins[pluginNames[i]];
                if(!plugin.hidden)
                    message+="• " + plugin.name + "\n";
            }

            message+="\nUse `/help commandName` to get help about a specific plugin.";
            reply({type:"text", text: message, options:{parse_mode: "Markdown"} })
        }
    });


    this.addPlugin = function(plugin){
        this.plugins[plugin.help.name] = plugin.help;
    };
};

module.exports = PluginHelper;