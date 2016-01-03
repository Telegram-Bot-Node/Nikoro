/*
    Util
    A module which collects a few useful functions 
    which could be used when developing plugins
*/

var Util = {};


/*
    A bit hacked together but it works.
    Need to finish docs

    What this function consider a valid command:
        * Starts with either ! or /
        * which is followed by the command name
        * which is followed by a series of arguments 
            * separeted by space or by what is passed as the splitBy variable 

    @param message - The message which you want to extract args from
    
    @param commandName - The command (string) or commands (array) that will trigger the match.            
            message =  "/yahoo text"
            parseCommand(message) ->  ["yahoo","text"]
            parseCommand(message,{commandName: "yahoo"}) ->  ["yahoo","text"]
            parseCommand(message,{commandName: ["yahoo","y"]}) ->  ["y","text"]
            parseCommand(message,{commandName: "google"}) ->  null 
                since the message command does not match the command passed as parameter
    
    @param options - An object that can have different properties specified.
    
    @param options.splitBy - Optional. The character that divides the parameters of the command, 
            Defaults to " " (space) if not set. 
    
    @param options.joinParams - Optional. Join all the parameters into a single string parameter, 
            The parameters will be joined with a " " (space) 
            Defailts to false if not set.
            
    @return - An array of the args of the command, 
        The first element of the array is the command name. (C / Python style)
        Returns null if the message is not a valid command (does not match the specified commands)  
*/

Util.parseCommand = function(message, commandName, options){
    
    options = options || {};
    var splitBy = options.splitBy || " ";
    var joinParams = options.joinParams || false;

    if (!splitBy)
        splitBy = " ";

    var regexParam = ""
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
    
    var re = new RegExp("^(?:\\/)(" + regexParam +")\\s+(.*)"); 
    var match = re.exec(message + " "); //we have to add this space because we specified "\s+" in the regex, to separate command from params, if we use "\s*" "!google test" -> ["g","oogle","test"] 

    var args = [];
    if (match) {

        var command = match[1].trim();
        args = [command];

        var params = match[2].split(splitBy);

        if (joinParams)
            params = [params.join(" ")];
        
        
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


Util.startsWith = function(string,what){
    return string.slice(0, what.length) == what;
}

module.exports = Util;