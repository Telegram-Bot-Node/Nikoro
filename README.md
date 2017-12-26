# Nikoro

[![Build Status](https://travis-ci.org/Telegram-Bot-Node/Nikoro.svg?branch=es6)](https://travis-ci.org/Telegram-Bot-Node/Nikoro)

An all-in-one, plugin-based, Telegram bot written in Node.js. 

See it in action on [@nikorobot](https://telegram.me/nikorobot)! [TODO]

Based on [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api).

## Quick install

```
git clone https://github.com/Telegram-Bot-Node/Nikoro
cd Nikoro
npm run setup:guided
```

After running `npm run bot`, you can simply add the bot to a group chat and it will work. You can also message it directly.

To see a list of available plugins, use the command `/help`; if you need help about a specific plugin, do `/help PluginName`.

See the [usage guide](http://telegram-bot-node.github.io/Nikoro/dist/user.html) for more information.

## Table of Contents

- [Features](#features)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Need help?](#need-help)

## Features
  
* **Plugin-based**: run many bots in one, have a plugin for everything.
* Support for inline commands, buttons, stickers, etc.
* Completely **customizable**: see something you don't like? Just change it!
* Written in **Node.js**: one of the most powerful and easiest programming languages available.
* Easy to install: just a few simple commands and your bot is up and running!
* Easy-to-write plugins: with many helper functions write powerful plugins in a few minutes. Connect to a database, download files, parse commands without writing any code: everything is already here for you.
* Open source :D

## Contributing

Did you make a plugin you want to share with everyone? Did you improve the code in any way? Did you fix an issue?

Submit a pull request! This project will only grow if *YOU* help!

Basic guidelines for contributing are outlined in `CONTRIBUTING.md`. We also have a complete [developer's guide](http://telegram-bot-node.github.io/Nikoro/dist/developer.html)! Finally, you can look at existing plugins (`src/plugins/Ping.js` can be a simple starting point) for a quick start.

## Contributors
In alphabetical order

* [CapacitorSet](https://github.com/CapacitorSet/)
    * Developed some plugins
    * Worked on a bit of everything, mostly internals
    * Messed up the code some more

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
    
## Need help?
[Send me a mail](bld.cris.96@gmail.com) or [create an issue](https://github.com/Telegram-Bot-Node/Nikoro/issues/new), I will answer ASAP. :+1:
