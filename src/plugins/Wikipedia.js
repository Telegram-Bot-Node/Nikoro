import Plugin from "../Plugin";
let Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));
import Util from "../Util";
import Bluebird from "bluebird";
import request from "request-promise";

export default class Wikipedia extends Plugin {
    static get plugin() {
        return {
            name: "Wiki Plugin",
            description: "Plugin for fetching Wikipedia articles",
            help: "/inline queries",
            needs: {
                config: {
                    TELEGRAM_BOT_USERNAME: "Telegram channel",
                    TELEGRAM_BOT_API: "Telegram bot API"
                }
            }
        };
    }
                  
    start() {
        assert(typeof Config.TELEGRAM_BOT_USERNAME === typeof "", "You must supply the telegram bot username.");
        assert(Config.TELEGRAM_BOT_USERNAME !== "", "Please supply a valid Username.");
        assert(typeof Config.TELEGRAM_BOT_API === typeof "", "You must supply the Telegram Bot API.");
        assert(Config.TELEGRAM_BOT_API !== "", "Please supply a valid API.");
        google = new Wikipedia({
            key: Config.TELEGRAM_BOT_USERNAME,
            cx: Config.TELEGRAM_BOT_API
        });
    }
    
    class Wikifetch {
    constructor(articleName) {
    this.wikiPrefix = 'http://en.wikipedia.org/wiki/';
    this.articleName = 'https://en.wikipedia.org/wiki/Telegram';
    this.fetchedArticle = {};
    }

    fetch(){
      let { parseTitle, parseLinks, parseSections, fetchedArticle, articleName, wikiPrefix } = this,
      articleURI = wikiPrefix + articleName,
      options = {
        uri: articleURI,
        transform: body => {
          return Plugin.load(body);
        }
    };

    return new Bluebird(function (resolve, reject) {
      request(options)
        .then($ => {
          parseTitle($, fetchedArticle);
          parseLinks($, fetchedArticle);
          parseSections($, fetchedArticle);

          resolve(fetchedArticle);
        })
        .catch(err => {
          reject(err);
        });

    });
  }

    parseTitle(ch, fe) {
      let title = ch('#firstHeading').text();
      fe.title = title;
    }

    parseLinks(ch, fe) {
      fe.links = {};

    ch('#bodyContent p a').each((idx, el) => {
      let element = new Plugin(el),
        href = element.attr('href'),
        entityName = href.replace(/\/wiki\//g, '');

      // Only extract article links.
      if (!href.match(/\/wiki\//g)) return;

      // Create or update the link lookup table.
      if (fe.links[entityName]) {
        fe.links[entityName].occurrences++;
      } else {
        fe.links[href.replace(/\/wiki\//g, '')] = {
          title: element.attr('title'),
          occurrences: 1,
          text: element.text()
        };
      }

      // Replace the element in the page with a reference to the link.
      element.replaceWith('[[' + entityName + ']]');
    });
  }

      parseSections(ch, fe){
         let currentHeadline = fe.title;
         fe.sections = {};
         
        ch('#bodyContent p,h2,h3,img').each((idx, el) => {
        let element = new Plugin(el);

      // Load new headlines as we observe them.
      if (element.is('h2') || element.is('h3')) {
        currentHeadline = element.text().trim();
        return;
      }

      // Initialize the object for this section.
      if (!fe.sections[currentHeadline]) {
        fe.sections[currentHeadline] = {
          text: '',
          images: []
        };
      }

      fe.sections[currentHeadline].text += element.text();
    });
    }
    }

       // this must return a promise
        export default function wikifetch(articleName) {
        let newWikiFetch = new Wikifetch(articleName);

        return newWikiFetch.fetch();
        }
}
