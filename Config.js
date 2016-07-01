var config = {
	telegramToken: process.env.TELEGRAM_TOKEN,
	activePlugins: [
		"ping",
		"8ball",
		"imgur",
		"karma",
		"quote",
		"roll",
		"set",
		"google",
		"youtube",
		"reddit",
		"math"
	]
}

module.exports = config;