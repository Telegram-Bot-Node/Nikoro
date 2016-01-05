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
        
        this.db.save(function(){
            console.log("Redis DB - Saved");
            callback();
        });
    });

    this.on("text", function (msg, reply){

        var matchHelp = Util.parseCommand(msg.text,["help"]);
        var matchList = Util.parseCommand(msg.text,["list"]);
        var matchStart = Util.parseCommand(msg.text,["start"]);
        var matchInfo = Util.parseCommand(msg.text,["info"]);


        if(matchHelp)
        {
            plugin = matchHelp[1];

            if(plugin)
            {
                if(this.plugins[plugin] && !this.plugins[plugin].hidden)
                {   
                    help = this.plugins[plugin];
                    message = "*" + help.name + "*\n" + "" + help.shortDescription + "\n\n" + help.fullHelp
                    reply({type:"text", text: message, options:{parse_mode: "Markdown"} })
                }
            }
            else
            {
                message = this.generateList();
                reply({type:"text", text: message, options:{parse_mode: "Markdown"} })
            }
            
        } 
        else if (matchList) 
        {
            message = this.generateList();
            reply({type:"text", text: message, options:{parse_mode: "Markdown"} });
        } 
        else if (matchStart) 
        {
            message = "Type `/list` or `/help` to see a list of available plugins. Use `/info` to get more info about me.";
            reply({type:"text", text: message, options:{parse_mode: "Markdown"} });
        }
        else if (matchInfo) 
        {
            message = "*Factotum Bot*\n\nThe only Telegram bot you will ever need.\n\nCreator: @crisbal | [Source Code](https://github.com/crisbal/Node-Telegram-Bot)";
            reply({type:"text", text: message, options:{parse_mode: "Markdown", disable_web_page_preview: true} });
        }
    });

    
    this.on("new_chat_participant", function (msg, reply){
        newUser = msg.new_chat_participant;
        if(newUser.username == this.botInfo.username)
        {
            reply({type: 'text', text: "Hello, I am Factotum Bot! Use  `/help` or `/list` to see a list of available plugins. Use `/info` to get more info about me.", options:{parse_mode: "Markdown"}});
            
        } 
    });


    this.addPlugin = function(plugin){
        this.plugins[plugin.properties.name] = plugin.properties;
    };

    this.generateList = function(){
        var message = "*Enabled Plugins*\n\n"
        var messageInline = "\n*Inline Plugins*\n\n"
        pluginNames = Object.keys(this.plugins)
        for(var i in pluginNames)
        {
            plugin = this.plugins[pluginNames[i]];
            if(!plugin.hidden && !plugin.onlyInline)
                message += "• " + plugin.name + "\n";
            else if(!plugin.hidden && plugin.inline)
                messageInline += "• " + plugin.name + "\n";
        }
        message += messageInline;
        message += "\nUse `/help pluginName` to get help about a specific plugin.";

        return message;
    }
};

module.exports = PluginHelper;