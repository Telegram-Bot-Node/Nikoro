# Telegram-Bot-Node

[![Build Status](https://travis-ci.org/crisbal/Telegram-Bot-Node.svg?branch=es6)](https://travis-ci.org/crisbal/Telegram-Bot-Node)

An all-in-one, plugin-based, Telegram bot written in Node.js. 

<!-- See it in action on `@Factotum_Bot` -->

Based on [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) 

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Using the bot](#using-the-bot)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Need help?](#need-help)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features
  
* **Plugin-based**: run many bots in one, have a plugin for everything.
* More than 30 plugins available!
* Support for inline commands, buttons, stickers, etc.
* Completely **customizable**: see something you don't like? Just change it!
* Written in **Node.js**: one of the most powerful and easiest programming languages available.
* Easy to install: just a few simple commands and your bot is up and running!
* Easy-to-write plugins: with many helper functions write powerful plugins in a few minutes. Connect to a database, download files, parse commands without writing any code: everything is already here for you.
* Open source :D

## Installation

* Clone the repository
* Create a Telegram bot and get the bot token (https://core.telegram.org/bots/#botfather)
* Run `npm run setup:guided` (or `npm run setup:expert` if you have more experience with Telegram and want to tweak your bot more)
* Run the bot with `npm run bot`
>You can stop the bot at any time with Ctrl+C.

## Using the bot

After running `npm run bot`, you can simply add the bot to a group chat and it will work. You can also message it directly.

To see a list of available plugins, use the command `/help`; if you need help about a specific plugin, do `/help pluginName`.

## Contributing

Did you make a plugin you want to share with everyone? Did you improve the code in any way? Did you fix an issue?

Submit a pull request! This project will only grow if *YOU* help!

Guidelines for contributing are outlined in `CONTRIBUTING.md`. If you need help writing plugins, check out the [wiki](https://github.com/crisbal/Telegram-Bot-Node/wiki), and look at existing plugins (`src/plugins/Ping.js` can be a simple starting point).

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
[Send me a mail](bld.cris.96@gmail.com) or [create an issue](https://github.com/crisbal/Telegram-Bot-Node/issues/new), I will answer ASAP. :+1:
