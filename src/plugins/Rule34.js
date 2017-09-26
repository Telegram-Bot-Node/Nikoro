const Plugin  = require("../Plugin");
const request = require("request");
const Util    = require("../Util");

module.exports = class Rule34 extends Plugin {
    static get plugin() {
        return {
            name: "Rule34",
            description: "If it exists, there's porn of it.",
            help: "/rule34 <query>",
            needs: { }
        }
    }

    onCommand({message, command, args}, reply) {
    	if (command !== "rule34") return;
    	if (args.length === 0) 
            return this.sendMessage(message.chat.id, "Please enter a search query.");
    	const query = args.join("+");
    	console.log(query)

    	console.log(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&tags=${encodeURIComponent(query)}`);

    	request(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1&tags=${encodeURIComponent(query).replace("%2B","+")}`, (err, res, data) => {
    		if (err || res.statusCode === 404)
                return this.sendMessage(message.chat.id, "An error occurred.");

            console.log(data)

            const regexp = /file_url="(\/\/img\.rule34\.xxx\/images\/\d+\/[0-9a-f]+\.\w+)"/ig

            const imgurlarr = data.match(regexp);

            console.log(imgurlarr);

            if (imgurlarr == null || imgurlarr.length === 0)
            	return this.sendMessage(message.chat.id, "No results found.");

            console.log(imgurlarr[0].substring(9).slice(1, -1));

            Util.downloadAndSaveTempResource("https:" + imgurlarr[0].substring(9).slice(1, -1), "jpg", imgpath => {
            	return this.sendPhoto(message.chat.id, imgpath);
            })
        })
    }
}