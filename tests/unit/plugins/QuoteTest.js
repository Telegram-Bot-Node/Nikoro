const assert = require('assert');
const Plugin = require('../../../src/plugins/Quote')
const message = require('../fixtures/QuoteMessage')

describe("Plugins", () => {
    describe("Quote", () => {
        it("has help description", () => {
            assert(Plugin.plugin.name)
            assert(Plugin.plugin.description)
            assert(Plugin.plugin.help)
        })

        it("has commands", () => {
            const plugin = new Plugin(undefined, undefined, false)

            assert(typeof plugin.commands === "object")
            assert(plugin.commands.addquote)
            assert(plugin.commands.quote)
        })


        it("add and find saved quote", () => {
            const plugin = new Plugin(undefined, undefined, false)
            const quoteId = 0

            assert(plugin.findQuote(quoteId) === "Quote not found")
            assert(plugin.addQuote(message) === "Quote added with ID " + quoteId)
            assert(plugin.findQuote(quoteId) === "<@ufocoder>: Lorem ipsum")
        })

        it("get random quote", () => {
            const plugin = new Plugin(undefined, undefined, false)

            assert(plugin.randomQuote() === "Quote not found")
            assert(plugin.addQuote(message) === "Quote added with ID 0")
            assert(plugin.randomQuote() === "<@ufocoder>: Lorem ipsum")
        })
    })
})