# Utilities

This file documents `Util.js`, a series of utilities you can use when writing plugins.

To begin using it in a plugin, simply import it: `import Util from "../Util";`.

## parseCommand

`parseCommand` parses a command string. For example:

```js
onText(message, reply) {
	let parts = Util.parseCommand(message.text, "foo");
}
```

 * If the bot receives a /foo command, for example `/foo bar baz`, `parts` will contain `["foo", "bar", "baz"]`.
 * If the bot doesn't receive a valid command, for example `/ping`, `parts` will be `null`.

### Options

You can pass options with the third parameter, eg. `Util.parseCommand(message.text, "foo", {noRequireTrigger: true})`.

 * `options.splitBy` is the character used when splitting the command string. For instance, if `splitBy` is set to `-`, `/set first value - second value` would be split as `["set", "first value", "second value"]` (without `splitBy`, it would have been split as `["set", "first", "value", "-", ...]`).
 * `options.joinParams` joins the parameters with a ` ` if set to `true`. For instance, `/foo bar baz` would be split as `["foo", "bar baz"]`.

## downloadAndSaveTempResource

`Util.downloadAndSaveTempResource(url, extension, callback)` downloads a file, saves it to a temporary location with the given extension, and then passes the temporary path to `callback`.

## buildPrettyUserName

`Util.buildPrettyUserName(user)` transforms `user` to a string, depending on its properties (`first_name`, `last_name`, `username` and `id`). For instance, `{username: "pdurov", id: 1234}` becomes `@pdurov [1234]`.