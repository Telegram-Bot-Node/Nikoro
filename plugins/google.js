/*
Search Google
!g <query>


Example:

You: !g test
Bot: title - link
*/

var request = require('request');

var google = function(){


    this.init = function(){
    
    };

    this.doStop = function(){

    };


    this.doMessage = function (msg, reply) {

        var re = /!g\s+(.*)/i; 
        var match = re.exec(msg.text);  
        
        if(match){ 
            
            reply({type:"status", status: "typing"});

            query = match[1].trim();

            if(query.length > 0){
                console.log("\tGoogle: " + query);
                link = "http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=" + encodeURIComponent(query) + "&key=" + apiKey;
                
                request(link, function (error, response, data) {
                    if (!error && response.statusCode == 200) {
                        
                        data = JSON.parse(data);
                        
                        if(data["responseData"])
                        {
                            if(data["responseData"]["results"])
                            {
                                var result = data["responseData"]["results"][0];
                                
                                title = result["titleNoFormatting"];
                                link = result["url"];
                               

                                if(title && link)
                                    reply({type:"text", text: title + " - " + link})       
                            }
                        }
                    }
                });

                
            }
        }
    };

};

module.exports = google;