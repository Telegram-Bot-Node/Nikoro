"use strict";

var Util = require('./../src/util');

var banner = function() {

    this.properties = {
        inline: true,
        onlyInline: true,
        shortDescription: "Create banners on the fly.",
        fullHelp: "Only available inline.\n`banner <text>`"
    };

    this.on("inline_query", function (query, reply){
        var banner = Util.parseInline(query.query,["banner"], {joinParams: true});
        if(banner)
        {   
            if(banner[1])
            {
                var toptext = banner[1].split(' ').join(' ');
                var toptext = toptext.toUpperCase();
                var toptext = encodeURIComponent(toptext);

                var news = "http://www.imagegenerator.net/newscaster/image.php?headline=BREAKING+NEWS&text="+toptext+"";
                var einstein = "http://www.hetemeel.com/einsteinshow.php?text=++++++++++++++++++%0D%0A%0D%0A++"+toptext+"";
                var darth = "http://www.addletters.com/pictures/star-wars-i-am-your-father-caption-generator/star-wars-i-am-your-father-caption-generator.php?caption="+toptext+"";
                var conf = "http://pictureimage.whak.com/signs/confucius/default.aspx?pic=confucius2&text="+toptext+"&color=black&fontsize=22&move2=&move=&font=bonzai&allow=366500";
                var jes = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=black&color2=&watermark=&gradient=&spacing=&x=169&y=137&w=148&h=110&move=0&move2=&rotate=18&fontsize=16&text="+toptext+"&font=Verdana&allow=6128&pic=jesus-christ&align=Center&align2=Middle&transparency=255";
                var bart = "http://www.addletters.com/pictures/bart-simpson-generator/bart-simpson-generator.php?line="+toptext+"";
                var ledfreeway = "http://www.addletters.com/pictures/electronic-freeway-sign-generator/electronic-freeway-sign-generator.php?sign="+toptext+"";
                var ledsimp = "http://www.addletters.com/pictures/the-simpsons-title-screen-generator/the-simpsons-title-screen-generator.php?caption="+toptext+"";
                var dr = "http://www.addletters.com/pictures/brain-age-doctor-ryuta-kawashima-image-generator/brain-age-doctor-ryuta-kawashima-image-generator.php?face=calm&caption="+toptext+"";
                var nwp = "http://www.addletters.com/pictures/newspaper-generator/newspaper-generator.php?section=NEWS&headline="+toptext+"";
                var homer = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=yellow&color2=black&watermark=&gradient=&spacing=&x=187&y=34&w=219&h=258&move=0&move2=&rotate=&fontsize=20&text="+toptext+"&font=simpsons&allow=6128&pic=Speaker-Phone&align=Center&align2=Middle&transparency=255";
                var ledbg = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=black&color2=&watermark=&gradient=&spacing=&x=11&y=20&w=250&h=78&move=0&move2=&rotate=&fontsize=14&text="+toptext+"&font=Comic&allow=6128&pic=bill-gates-jr&align=center&align2=Middle&transparency=255";
                var ledwin = "http://pictureimage.whak.com/signs/parody/windows/bluescreen/default.aspx?text="+toptext+"&color=white&fontsize=12&move2=&move=&font=fixedsys&allow=366500&pic=bluescreen";
                var ledfbi = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=white&color2=black&watermark=&gradient=&spacing=&x=15&y=108&w=388&h=182&move=0&move2=&rotate=&fontsize=24&text="+toptext+"&font=signbold&allow=6128&pic=FBI-Warning&align=center&align2=Middle&transparency=255";
                var ledrnd = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=blue&color2=black&watermark=&gradient=red&spacing=&x=76&y=150&w=268&h=138&move=0&move2=&rotate=-1.4&fontsize=22&text="+toptext+"&font=Jester&allow=6128&pic=Proud-American&align=Center&align2=Middle&transparency=255";
                var ledfc = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=black&color2=&watermark=&gradient=&spacing=&x=131&y=204&w=145&h=118&move=0&move2=&rotate=&fontsize=16&text="+toptext+"&font=Psycho&allow=6128&pic=Fight-Club&align=center&align2=Middle&transparency=255";
                var ledmed = "http://pictureimage.whak.com/signs/sign-generator/?allow=106&text="+toptext+"&font=HandItalic&color=black&fontsize=17&move2=48&move=80&rot=-2&pic=Medical-Prescription-Drugs&height=&width=&offx=5&offy=5&spacing=35&gradient=&tag=left&bubble=&bubH=&bubW=&watermark=&background=&border=&picURL=&shade=no&shadecolor=black";
                var ledtb = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=dimgray&color2=gainsboro&watermark=&gradient=&spacing=&x=124&y=60&w=268&h=157&move=0&move2=&rotate=-7&fontsize=26&text="+toptext+"&font=homework&allow=6128&pic=Tony-Blair-UK&align=Center&align2=Middle&transparency=255";
                var lednok = "http://pictureimage.whak.com/signs/sign-generator/simple.aspx?color=black&color2=&watermark=&gradient=&spacing=&x=117&y=187&w=219&h=174&move=0&move2=&rotate=&fontsize=18&text="+toptext+"&font=dotmatrix&allow=6128&pic=nokia-text-messaging&align=left&align2=Middle&transparency=255";
                var ledalert = "http://pictureimage.whak.com/signs/danger/default.aspx?text="+toptext+"&color=black&fontsize=14&move2=&move=&font=stencil&allow=366500&pic=bright-caution";
                var ledblue = "http://dummyimage.com/600x400/003dd6/ffffff&text="+toptext;
                var resultsbanner = [
                // {id:"0", type:'photo',photo_url: urlscn, thumb_url: urlscn ,photo_width: 1000,photo_height: 1000 },
                {id:"0", type:'photo',photo_url: darth ,thumb_url: darth ,photo_width: 1000,photo_height: 600 },
                // {id:"2", type:'photo',photo_url: sam ,thumb_url: sam ,photo_width: 1000,photo_height: 1000 },
                // {id:"3", type:'photo',photo_url: riverside ,thumb_url: riverside ,photo_width: 1000,photo_height: 1000 },
                // {id:"1", type:'photo',photo_url: news ,thumb_url: news ,photo_width: 1000,photo_height: 600 },
                {id:"2", type:'photo',photo_url: einstein ,thumb_url: einstein ,photo_width: 1000,photo_height: 600 },
                //  {id:"6", type:'photo',photo_url: street ,thumb_url: street ,photo_width: 1000,photo_height: 600 },
                {id:"3", type:'photo',photo_url: conf ,thumb_url: conf ,photo_width: 600,photo_height: 1000 },
                {id:"4", type:'photo',photo_url: jes ,thumb_url: jes ,photo_width: 600,photo_height: 1000 },
                {id:"5", type:'photo',photo_url: bart ,thumb_url: bart ,photo_width: 1000,photo_height: 600 },
                
                {id:"6", type:'photo',photo_url: ledfreeway ,thumb_url: ledfreeway ,photo_width: 1000,photo_height: 600 },
                {id:"7", type:'photo',photo_url: ledsimp ,thumb_url: ledsimp ,photo_width: 1000,photo_height: 600 },
                {id:"8", type:'photo',photo_url: dr ,thumb_url: dr ,photo_width: 1000,photo_height: 600 },
                // {id:"13", type:'photo',photo_url: nd ,thumb_url: nd ,photo_width: 1000,photo_height: 600 },
                {id:"9", type:'photo',photo_url: nwp ,thumb_url: nwp ,photo_width: 1000,photo_height: 600 },
                {id:"10", type:'photo',photo_url: homer ,thumb_url: homer ,photo_width: 1000,photo_height: 1000 },
                {id:"11", type:'photo',photo_url: ledbg ,thumb_url: ledbg ,photo_width: 1000,photo_height: 1000 },
                {id:"12", type:'photo',photo_url: ledwin ,thumb_url: ledwin ,photo_width: 1000,photo_height: 600 },
                {id:"14", type:'photo',photo_url: ledfbi ,thumb_url: ledfbi ,photo_width: 1000,photo_height: 1000 },
                {id:"15", type:'photo',photo_url: ledrnd ,thumb_url: ledrnd ,photo_width: 1000,photo_height: 600 },
                {id:"16", type:'photo',photo_url: ledfc ,thumb_url: ledfc ,photo_width: 1000,photo_height: 1000 },
                {id:"17", type:'photo',photo_url: ledmed ,thumb_url: ledmed ,photo_width: 600,photo_height: 1000 },
                {id:"18", type:'photo',photo_url: ledtb ,thumb_url: ledtb ,photo_width: 1000,photo_height: 600 },
                {id:"19", type:'photo',photo_url: lednok ,thumb_url: lednok ,photo_width: 1000,photo_height: 800 },
                {id:"23", type:'photo',photo_url: ledalert ,thumb_url: ledalert ,photo_width: 1000,photo_height: 500 },
                {id:"24", type:'photo',photo_url: ledblue ,thumb_url: ledblue ,photo_width: 640,photo_height: 480 },
                ];
                reply(resultsbanner);
            }
        }
    });
};

module.exports = banner;