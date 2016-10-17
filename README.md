#Telegram-Bot-Node

[![Build Status](https://travis-ci.org/crisbal/Telegram-Bot-Node.svg?branch=es6)](https://travis-ci.org/crisbal/Telegram-Bot-Node)

An all-in-one, plugin-based, Telegram bot written in Node.js. 

<!-- See it in action on `@Factotum_Bot` -->

Based on [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) 

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
###Table of Contents

- [Plugins](#plugins)
  - [Adding a plugin](#adding-a-plugin)
  - [Writing](#writing)
    - [Responding to messages](#responding-to-messages)
    - [Parsing messages](#parsing-messages)
    - [Permanent storage, configuration](#permanent-storage-configuration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

##Features
  
<!--  * 20+ plugins already available! -->
<!-- * Inline plugins available! -->
* **Plugin-based**: run many bots in one, have a plugin for everything.
* Completely **customizable**: see something you don't like? Just change it!
* Written in **Node.js**: one of the most powerful and easiest programming language available.
* Easy to install: just a few simple commands and your bot is up and running!
* Easy-to-write plugins: with many helper functions write powerful plugins in a few minutes. 
    * Connect to a database, download files, parse commands without writing any code: everything is already here for you   
* Open Source :D

##Running the bot

* Clone the repository
* Install a Redis server
* Create a Telegram bot and get the bot token (https://core.telegram.org/bots/#botfather)
* Run `npm run firstrun`
* Run the bot with `npm run bot`
>You can stop the bot at any time with Ctrl+C.

##Using the bot
You can simply add the bot to a group chat and it will work. You can also message it directly.

To see a list of available plugins, use the command `/help`; if you need help about a specific plugin, do `/help pluginName`.

## Plugins

If you know JavaScript (ES6, specifically), you can easily write plugins for your bot.

>The documentation may not be up to date, or may not cover some special cases yet. If you want to write your own plugin, it is suggested that you look at some existing plugins (`plugins/` folder), like Ping.

### Adding a plugin

* Create a file in `src/plugins`, for example, `src/plugins/MyPlugin.js`.
>You can use `Ping.js` as a template.
* Edit `config.json`. Add `"MyPlugin"` to the list of active plugins:

```json
activePlugins: {
    "Auth",
    "Config",
    "MyPlugin"
}
```

### Writing

See `docs/Plugin.md`, `docs/Util.md`.

##Contributing
Did you made a plugin you want to share with everyone? Did you improve the code in any way? Did you fix an issue?

Submit a pull request! 

This project will only grow if *YOU* help!

Guidelines for contributing are outlined in `CONTRIBUTING.md`.

##Contributors
In alphabetical order

* [Cristian Baldi](https://github.com/crisbal/)
    * Crated the project
    * Developed a bunch of plugins
    * Added redis support
    * Improved the plugin system
    * Messed up the code
    
* [Phill Farrugia](https://github.com/phillfarrugia/)
    * Improved & documented the code
    * Added Heroku Integration
    * Created Unit Tests
    * Added automatic testing via Travis CI 
    
##Need help?
Send me a mail or create an issue, I will answer ASAP. :+1:

##License

MIT License

Copyright © 2015 Cristian Baldi, bld.cris.96@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.RESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
