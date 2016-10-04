# Writing plugins

Plugins are classes that listen to specific events from the Telegram API.

## General structure

>See the architecture diagrams in this folder for an overview of how plugins communicate with the other components.

```js
import Plugin from "../Plugin";
import Util from "../Util";
import foo from "bar";

export default class MyPlugin extends Plugin {
	static get plugin() {
		return {
			name: "MyPlugin",
			description: "...",
			help: "...",
			needs: {
				/* ... */
			}
		}
	}

	start() { // Optional
		foo.start();
	}

	stop() { // Optional
		foo.stop();
	}

	check() { // Optional
		assert(foo.alright, "Couldn't load the module 'foo'!");
	}

	onText(message, reply) {
		/* ... */
	}

	onPhoto(message, reply) {
		/* ... */
	}

	/* ... */
}

## Metadata

Every plugin must provide some data about itself, using the `plugin` getter. It returns an object with the following properties:

 * `name`, mandatory
 * `description`, a short description of what the plugin does (recommended)
 * `help`, the help text to be shown when the user runs `/help myPlugin` (recommended)
 * `needs`, an object documenting special features required by the plugin
   * `database`, if the plugin requires persistent state.
   > You can store persistent state in the Redis database using `this.db`. For instance, `this.db.foo = "bar"`.
 * `visibility`, either `Plugin.Visiblity.VISIBLE` (the default) or `Plugin.Visibility.HIDDEN`. You probably won't need this.
 * `type`, a bitmask of `Plugin.Type.NORMAL`, `.INLINE` (whether the plugin can be used in inline mode), `.PROXY` (whether the plugin acts as a proxy, see below), and `.SPECIAL` (for internal usage). The default is `.NORMAL`.

## Start, stop

`start` and `stop` are optional methods, which take no arguments and need not return anything.

If the plugin is in an invalid state (for instance, a token is invalid), or an issue occurs while initialising the plugin, `start` must throw an error. This will cause the plugin not to be loaded.

## onText, onPhoto, ...

These (optional) functions are called when a message of their type is received. The full list is: `onText`, `onAudio`, `onDocument`, `onPhoto`, `onSticker`, `onVideo`, `onVoice`, `onContact`, `onLocation`, `onNewChatParticipant`, `onLeftChatParticipant`. They are passed two parameters, `message` and `reply`. The former is the object returned by the Telegram API; the latter is a function, to be called like this: `reply({type: "text", text: "Hello!"})`.

>Plugins are not required to implement any of these methods. Proxies, for instance, usually don't.

## Proxy

If a plugin is registered as a proxy (the bitmask `type` contains the bit `Plugin.Type.PROXY`), this method is called on every incoming message. It returns an ES6 Promise.
 * If the Proxy *approves* the message, it returns a Promise that resolves to the `message` object.
 * If the Proxy *rejects* the message, it returns a Promise that rejects. It will cause the message not to be passed along the plugin chain.

>Note that while in theory you could rewrite the message before passing it to `Promise.resolve`, doing so is *undefined behaviour*.
