/*
    Util
    A module which collects a few useful functions 
    which could be used when developing plugins
*/

var util = {};


/*
    A bit hacked together but it works.
    Need to finish docs

    What this function consider a valid command:
        * Starts with either ! or /
        * which is followed by the command name
        * which is followed by a series of arguments 
            * separeted by space or by what is passed as the split_by variable 

    @param message - The message which you want to extract args from
    
    @param commandName - Optional. The command or commands that will trigger the match.
                        defaults to "[a-zA-Z0-9]+" (any text) if not set.
                    Example: 
                    message =  "/yahoo text"
                    parseCommand(message) ->  ["yahoo","text"]
                    parseCommand(message,"yahoo") ->  ["yahoo","text"]
                    parseCommand(message,["yahoo","y"]) ->  ["y","text"]
                    parseCommand(message,"google") ->  null 
                        since the message command does not match the command passed as parameter

    
    @param split_by - Optional. The character that divides the parameters, 
                        defaults to " " (space) if not set. 

    @return - An array of the args of the command, 
        the first element of the array is the command called. (C / Python style)
        Returns null if the message is not a valid command (does not match the regex)  
*/

util.parseCommand = function(message, commandName, split_by){
    if (!split_by)
        split_by = " ";

    var regexParam = ""
    if (!commandName) {
        commandName = "[a-zA-Z0-9]+";
    } else {
        if (typeof commandName === 'string')
            commandName = [commandName];


        //let's build a valid regex that matches any of the passed commands
        //["g","google","ggl"] -> g|google|ggl
        regexParam = ""; 
        for (var i = 0; i < commandName.length; i++) {
            regexParam += commandName[i];

            if (i != commandName.length - 1)
                regexParam += "|";
        }
    }
    var re = new RegExp("(?:!|\\/)(" + regexParam +")\\s+(.*)"); 
    var match = re.exec(message + " "); //we have to add this space because we specified "\s+" in the regex, to separate command from params, if we use "\s*" "!google test" -> ["g","oogle","test"] 
        
    var args = [];
    if (match) {
        var command = match[1].trim();
        var params = match[2].split(split_by);
        
        args = [command];

        for (var i=0;i<params.length;i++) {
            var param = params[i].trim();
            if(param.length>0)
                args.push(param);
        }
        return args;

    } else {
        return null;
    } 
}

module.exports = util;