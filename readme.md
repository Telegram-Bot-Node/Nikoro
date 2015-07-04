#Node-Telegram-Bot

A Telegram Bot which supports user-made plugins. 

Platform: Node.js 


## Will fix readme and more stuff later

## How to use the bot

* Clone/Download/Fork the repository
* ```npm install```
* Create a Bot Account 
    * Get the associated token (https://core.telegram.org/bots/#botfather)
* Edit config.js
    * Set ```telegramToken``` with the auth token of your bot
    * Edit ```activePlugins``` if you want to edit the active plugins 
* Run the bot
    * ```node bot.js``` 
    * Stop it at any time with CTRL+C

## Writing custom plugins

* Take a look at the provided plugins in the ```plugins``` folder
* Create a ```.js``` file in the ```plugins``` folder

Basic Skeleton
``` javascript
var pluginName = function(){

    this.init = function(){
        //this will be executed when the bot starts
    };

    this.doStop = function(){
        //this will be executed when the bot shuts down
    };  


    this.doMessage = function (msg, reply) {
        //this will be executed whenever your bot get a message

        /*
            1. Check if the msg.text matches the trigger for your plugin
            2. Do stuff you need
            3. Produce reply 
                replyText = {type:"text", text:"Message you want to post"}
                replyAudio = {type:"audio", audio:"path/to/audio.mp3"}
            4. Post the reply
                reply(replyText); //for example

        */
    };

};

module.exports = pluginName;
```

## Contributing

Did you made a plugin you want to share with the world? Submit a pull request! 