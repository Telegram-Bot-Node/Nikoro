module.exports = {
    "parserOptions": {
        "ecmaVersion": 8
    },
    "extends": "google",
    "rules": {
        "arrow-parens": ["warn", "as-needed"],
        "camelcase": [1, {
            "properties": "never"
        }],
        "comma-dangle": ["warn", "never"],
        "curly": 0,
        "default-case": 0,
        "eol-last": 0,
        "indent": ["error", 4],
        "max-len": 0,
        "new-cap": 1,
        "no-console": 2,
        "no-extend-native": 0,
        "no-loop-func": 1,
        "no-unused-vars": 1,
        "no-var": 2,
        "no-warning-comments": 1,
        "prefer-const": 1,
        "quotes": ["error", "double"],
        "require-jsdoc": 0
    }
};