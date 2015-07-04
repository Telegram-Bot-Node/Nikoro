var cheerio = require('cheerio'), request = require('request');

var yp = function(){

    this.init = function(){

    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {
        var re = /!yp\s+(.*)/i; 
        var match = re.exec(msg.text);  
        
        if(match){ 
            query = match[1].trim();

            if(query.length > 0){
                console.log("\tYP: " + query);
                link = "http://www.youporn.com/search/?query=" + encodeURIComponent(query);
                
                request(link, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(html);
                            var title = $($('.videoBox .videoTitle')[0]).text();
                            var link = "http://www.youporn.com" + $($('.videoBox > div > a')[0]).attr("href");
                            if(title && link){
                                reply({type:"text", text: title + " - " + link})
                            }
                        }
                    }
                });

                
            }
        }
    };

};

module.exports = yp;