# Contributing

## Pull requests

Are welcome.

## Coding standards

Please make sure `eslint src/` runs without errors before submitting your code.

We use the [Google coding standards](https://google.github.io/styleguide/javascriptguide.xml), with a few modifications. Here are the most important ones:

 * Curly braces after `if` aren't mandatory;
 * **4 spaces indentation**;
 * JSDoc comments aren't required nor suggested.

When possible, use promises rather than callbacks, ES6 objects (eg. `let` and `const` rather than `var`), and early returns. Prefer clarity over conciseness.

## Git commit messages

* Separate subject from body with a blank line
* Limit the subject line to 50 characters
* Capitalize the subject line
* Do not end the subject line with a period
* Use the imperative mood in the subject line
* Wrap the body at 72 characters
* Use the body to explain what and why vs. how

(taken from http://chris.beams.io/posts/git-commit/#seven-rules)
