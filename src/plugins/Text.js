const Plugin = require("./../Plugin");

const smallCaps = {a: "\u1d00", A: "\u1d00", b: "\u0299", B: "\u0299", c: "\u1d04", C: "\u1d04", d: "\u1d05", D: "\u1d05", e: "\u1d07", E: "\u1d07", f: "\ua730", F: "\ua730", g: "\u0262", G: "\u0262", h: "\u029c", H: "\u029c", i: "\u026a", I: "\u026a", j: "\u1d0a", J: "\u1d0a", k: "\u1d0b", K: "\u1d0b", l: "\u029f", L: "\u029f", m: "\u1d0d", M: "\u1d0d", n: "\u0274", N: "\u0274", o: "\u1d0f", O: "\u1d0f", p: "\u1d29", P: "\u1d29", q: "q", Q: "Q", r: "\u0280", R: "\u0280", s: "\ua731", S: "\ua731", t: "\u1d1b", T: "\u1d1b", u: "\u1d1c", U: "\u1d1c", v: "\u1d20", V: "\u1d20", w: "\u1d21", W: "\u1d21", x: "x", X: "x", y: "y", Y: "Y", z: "\u1d22", Z: "\u1d22"};
const circled = {a: "\u24d0", A: "\u24b6", b: "\u24d1", B: "\u24b7", c: "\u24d2", C: "\u24b8", d: "\u24d3", D: "\u24b9", e: "\u24d4", E: "\u24ba", f: "\u24d5", F: "\u24bb", g: "\u24d6", G: "\u24bc", h: "\u24d7", H: "\u24bd", i: "\u24d8", I: "\u24be", j: "\u24d9", J: "\u24bf", k: "\u24da", K: "\u24c0", l: "\u24db", L: "\u24c1", m: "\u24dc", M: "\u24c2", n: "\u24dd", N: "\u24c3", o: "\u24de", O: "\u24c4", p: "\u24df", P: "\u24c5", q: "\u24e0", Q: "\u24c6", r: "\u24e1", R: "\u24c7", s: "\u24e2", S: "\u24c8", t: "\u24e3", T: "\u24c9", u: "\u24e4", U: "\u24ca", v: "\u24e5", V: "\u24cb", w: "\u24e6", W: "\u24cc", x: "\u24e7", X: "\u24cd", y: "\u24e8", Y: "\u24ce", z: "\u24e9", Z: "\u24cf"};
const fullWidth = {a: "\uff41", A: "\uff21", b: "\uff42", B: "\uff22", c: "\uff43", C: "\uff23", d: "\uff44", D: "\uff24", e: "\uff45", E: "\uff25", f: "\uff46", F: "\uff26", g: "\uff47", G: "\uff27", h: "\uff48", H: "\uff28", i: "\uff49", I: "\uff29", j: "\uff4a", J: "\uff2a", k: "\uff4b", K: "\uff2b", l: "\uff4c", L: "\uff2c", m: "\uff4d", M: "\uff2d", n: "\uff4e", N: "\uff2e", o: "\uff4f", O: "\uff2f", p: "\uff50", P: "\uff30", q: "\uff51", Q: "\uff31", r: "\uff52", R: "\uff32", s: "\uff53", S: "\uff33", t: "\uff54", T: "\uff34", u: "\uff55", U: "\uff35", v: "\uff56", V: "\uff36", w: "\uff57", W: "\uff37", x: "\uff58", X: "\uff38", y: "\uff59", Y: "\uff39", z: "\uff5a", Z: "\uff3a"};
const letterSmall = {a: "\u1d43", A: "\u1d2c", b: "\u1d47", B: "\u1d2e", c: "\u1d9c", C: "C", d: "\u1d48", D: "\u1d30", e: "\u1d49", E: "\u1d31", f: "\u1da0", F: "F", g: "\u1d4d", G: "\u1d33", h: "\u02b0", H: "\u1d34", i: "\u1da4", I: "\u1d35", j: "\u02b2", J: "\u1d36", k: "\u1d4f", K: "\u1d37", l: "\u02e1", L: "\u1dab", m: "\u1d50", M: "\u1d39", n: "\u1daf", N: "\u1db0", o: "\u1d52", O: "\u1d3c", p: "\u1d56", P: "\u1d3e", q: "q", Q: "Q", r: "\u02b3", R: "\u1d3f", s: "\u02e2", S: "S", t: "\u1d57", T: "\u1d40", u: "\u1d58", U: "\u1d41", v: "\u1d5b", V: "\u2c7d", w: "\u02b7", W: "X", x: "\u02e3", X: "\u1d42", y: "\u02b8", Y: "Y", z: "\u1dbb", Z: "Z"};
const upsideDown = {a: "\u0250", A: "\u0250", b: "q", B: "q", c: "\u0254", C: "\u0254", d: "p", D: "p", e: "\u01dd", E: "\u01dd", f: "\u025f", F: "\u025f", g: "\u0183", G: "\u0183", h: "\u0265", H: "\u0265", i: "\u0131", I: "\u0131", j: "\u027e", J: "\u027e", k: "\u029e", K: "\u029e", l: "\u05df", L: "\u05df", m: "\u026f", M: "\u026f", n: "u", N: "u", o: "o", O: "o", p: "d", P: "d", q: "b", Q: "b", r: "\u0279", R: "\u0279", s: "s", S: "s", t: "\u0287", T: "\u0287", u: "n", U: "n", v: "\u028c", V: "\u028c", w: "\u028d", W: "\u028d", x: "x", X: "\u028d", y: "\u028e", Y: "x", z: "z", Z: "z"};

function translateText(text, dict) {
    let string = "";
    for (let i = 0; i < text.length; i++)
        string += dict[text[i]] || text[i];
    return string;
}

module.exports = class Text extends Plugin {

    static get plugin() {
        return {
            name: "Text",
            description: "Unicode magic on any text."
        };
    }

    onInlineCommand({message, command, args}, reply) {
        if (command !== "text") return;
        const text = args.join(" ");

        const textSmallCaps = translateText(text, smallCaps);
        const textCircled = translateText(text, circled);
        const textFullWidth = translateText(text, fullWidth);
        const textLetterSmall = translateText(text, letterSmall);
        const textUpsideDown = translateText(text, upsideDown);

        reply({
            type: "inline",
            results: [
                {id: "0", type: 'article', message_text: textSmallCaps, title: textSmallCaps},
                {id: "1", type: 'article', message_text: textCircled, title: textCircled},
                {id: "2", type: 'article', message_text: textFullWidth, title: textFullWidth},
                {id: "3", type: 'article', message_text: textLetterSmall, title: textLetterSmall},
                {id: "4", type: 'article', message_text: textUpsideDown, title: textUpsideDown}
            ]
        });
    }
}