#Telegram-Bot-Node

[![Build Status](https://travis-ci.org/crisbal/Telegram-Bot-Node.svg?branch=es6)](https://travis-ci.org/crisbal/Telegram-Bot-Node)

An all-in-one, plugin-based, Telegram Bot written in Node.js. 

See it in action on `@Factotum_Bot`

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

* Plugin-based: run many bots in one, have a plugin for everything.
    * 20+ plugins already available!
    * Inline plugins available!
* Completely customizable: see something you don't like? Just change it!
* Written in Node.js: one of the most powerful and easiest programming language available.
* Easy to install: just a few simple commands and your bot is up and running!
* Easy-to-write plugins: with many helper functions write powerful plugins in a few minutes. 
    * Connect to a database, download files, parse commands without writing any code: everything is already here for you   
* Open Source :D

##Running the Bot

* Clone/Download/Fork the repository
* Install `redis` (and check if it is working)
* `npm install`
* Create a Bot on Telegram 
    * Get the associated HTTP Api Token (https://core.telegram.org/bots/#botfather)
* Set the required Environment Variables (two methods)
    1. Via `setup.sh`
        * Edit `setup.sh`
            * Set `TELEGRAM_TOKEN` with the auth token of your bot
            * Set the other API Keys if you want to enable the relative plugins.
        * Run `source setup.sh`
    2. Set them manually in `config.js`
        * If you are more comfortable this way
    3. Set them in any other way in your system
        * If you can't/won't use the `source` command     
* Edit config.js
    * Edit `activePlugins` if you want to edit the active plugins. It is an array of the filenames of the active plugins. 
        * You can find all the available plugins in the `plugins` folder.
* Run the bot
    * `node bot.js` 
    * Stop it at any time with CTRL+C

##Using the Bot

Send a message to the bot or add it to a group chat and you are ready to use it!

Use ```/list``` to see a list of the enabled plugins or ```/help <plugin-name>``` to get an explanation for each enabled plugin.

## Plugins

Plugins can be easily written with a basic understanding of JavaScript.

>The documentation may not be up to date, or may not cover some special cases yet. If you want to write your own plugin, it is suggested that you look at some existing plugins (`plugins/` folder), like Ping.

### Adding a plugin

* Create a file in `src/plugins`, for example, `src/plugins/MyPlugin.js`.
>You can use `Ping.js` as a template.
* Edit `Config.js`. Add `"MyPlugin"` to the list of active plugins:

```js
Config.activePlugins = [
    "Auth",
    "Config",
    "MyPlugin"
]
```

### Writing
Every plugin is a class that extends Plugin. This is the skeleton:
```js
import Plugin from "./../Plugin";
export default class MyPlugin extends Plugin {
    get plugin() {
        name: "MyPlugin",
        description: "I repeat text.",
        help: "/echo <text>"
    }
}
```

#### Responding to messages

`onText(message, reply)` is called when a text message is received. (`onPhoto` is called when a photo is received, `onSticker` for stickers, and so on.)

`message` is a [MessageEntity](https://core.telegram.org/bots/api#messageentity) from the Telegram API; `reply` is a function to be called to send a text reply. It looks like this:

```js
reply({
    type: "text",
    text: "Hello world!"
});
```

#### Parsing messages

Use the Util module for parsing messages:

```js
import Util from "../Util";
export default class MyPlugin extends Plugin {
    /* ... */
    onText(message, reply) {
        let parts = Util.parseCommand(message.text, "echo");
        if (!parts) {
            // The message didn't start with /echo.
            // Let's reject it.
            return;
        }
        /* message.text = "/echo Hello world!"
         * parts = ["echo", "Hello", "world!"]
         */
        reply({type: "text", text: parts.splice(1).join(" ")});
    }
}
```

#### Permanent storage, configuration

If you need permanent storage (for example, to store a list of ignored users), add `needs: {database: true}` to the plugin settings:

```js
export default class Ping extends Plugin {
    get plugin() {
        name: "Ping",
        description: "Ping - pong!",
        help: "/ping",
        needs: {
            database: true
        },
        defaults: {
            message: "Pong!"
        }
    }
}
```

You will then have access to the variable `this.db`, which represents an object in the Redis database. For the most part, you can use it as a normal JavaScript object (see the documentation for Rebridge for more information - for example, it can't contain functions, or circular references).

Configuration variables are especially important, in that you can let users change them (`/config set Ping message "Pong!"`). They are stored in `this.config`. You can define default values using `defaults` in the plugin metadata.

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

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
