# npm-historian

[![npm package version](https://badge.fury.io/js/npm-historian.svg)](https://www.npmjs.com/package/npm-historian)

`npm-historian` is a Node.js package (and CLI) for resolving [`npm`](https://www.npmjs.com/) dependencies to exact versions at a specific point in time.

Given a package name and version (range) string,
`npm-historian` finds the exact version that was/would be/have been installed,
were you to have run `npm install` on the specified date (+ time for increased specificity).

This exists because I was cavalier in my youth,
heedless of ["semantic" versioning](https://semver.org/) and other best practices regarding versioning,
and then, one day, impetuously deleted all my `node_modules/` directories.


## Installation

Install from [npm](https://www.npmjs.com/package/npm-historian):

    npm install --global npm-historian


## Examples

* Which `babel` were you on back in the middle of 2015?

      npm-historian --timestamp 2015-07-01 babel

  > babel@* resolved to "5.6.14" at 2015-07-01

  Okay, but what's the latest compatible (pray to the semver gods) version _now_?

      npm-historian babel@^5.6.14

  > babel@^5.6.14 resolved to "5.8.38" at 2018-02-09T23:49:03.983Z
* If no compatible version exists, `npm-historian` returns `null`:

      npm-historian --timestamp 2018-02-09 typescript@~3

  > typescript@~3 resolved to "null" at 2018-02-09
* `marked`, on the day [snyk.io](https://snyk.io/blog/marked-xss-vulnerability/) reported its XSS vulnerability:

      npm-historian --timestamp 2016-05-16 marked

  > marked@* resolved to "0.3.5" at 2016-05-16
* `left-pad`, that contentious package/module/function, on the day Azer Koçulu unpublished it:

      npm-historian --timestamp 2016-03-22 left-pad

  > left-pad@* resolved to "0.0.4" at 2016-03-22

  (Which isn't quite right, but there was some weird rewriting of history going on that day in that package.)

  But suppose you had used `npm install --save left-pad` to install it:

      npm-historian --timestamp 2016-03-22 left-pad@^0.0.3

  > left-pad@^0.0.3 resolved to "null" at 2016-03-22

  Tough luck :(
* You can also resolve an entire `package.json` and all its (`dev`|`peer`|`bundled`|`optional`)`dependencies`:

      npm-historian --timestamp 2016-09-08 package.json

  > _(the entire package.json, with all versions pinned down as of 2016-09-08)_


## License

Copyright 2018 Christopher Brown.
[MIT Licensed](https://chbrown.github.io/licenses/MIT/#2018).
