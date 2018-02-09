# npm-historian

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


## License

Copyright 2018 Christopher Brown.
[MIT Licensed](https://chbrown.github.io/licenses/MIT/#2018).
