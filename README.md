# JSC (formerly js-complexity-viz)

[![NPM info][nodei.co]](https://npmjs.org/package/jsc)

[![Build status][ci-image]][ci-status]
[![dependencies][dependencies-image]][dependencies-url]
[![endorse][endorse-image]][endorse-url]

JavaScript source code complexity tool

This is a runner/wrapper around Phil Booth's tool [*complexity report*](https://github.com/philbooth/complexityReport.js "Complexity report at github")

## Install and run

	npm install -g jsc
	jsc foo.js tests/*.js

It can also be installed locally and used from other modules. See *js-complexity-viz.js* source file.

Use -h option to see all (few) options

Outputs:

1. *report.html* (based on template, uses Google charting library)
2. *report.json* (collected js file complexity statistics)

For example, the html can be ingested into Jenkins build system when using *HTML publisher plugin*

## License

The MIT License, see [*MIT-License.txt*](js-complexity-viz/blob/master/MIT-License.txt "MIT-License.txt")

## Contact

Gleb Bahmutov <gleb.bahmutov@gmail.com>

[ci-image]: https://secure.travis-ci.org/bahmutov/js-complexity-viz.png?branch=master
[ci-status]: http://travis-ci.org/#!/bahmutov/js-complexity-viz
[nodei.co]: https://nodei.co/npm/jsc.png?downloads=true
[dependencies-image]: https://david-dm.org/bahmutov/js-complexity-viz.png
[dependencies-url]: https://david-dm.org/bahmutov/js-complexity-viz
[endorse-image]: https://api.coderwall.com/bahmutov/endorsecount.png
[endorse-url]: https://coderwall.com/bahmutov
