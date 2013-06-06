# JSC (formerly js-complexity-viz)

[![Build status][ci-image]][ci-status]

JavaScript source code complexity tool

This is a runner/wrapper around Phil Booth's tool [*complexity report*](https://github.com/philbooth/complexityReport.js "Complexity report at github")

Install and run
===============

	npm install -g jsc
	jsc foo.js tests/*.js

It can also be installed locally and used from other modules. See *js-complexity-viz.js* source file.

Use -h option to see all (few) options

Outputs: 

*report.json* (collected js file complexity statistics)

License
=======

The MIT License, see [*MIT-License.txt*](js-complexity-viz/blob/master/MIT-License.txt "MIT-License.txt")

Contact
=======

Gleb Bahmutov <gleb.bahmutov@gmail.com>

[ci-image]: https://secure.travis-ci.org/bahmutov/js-complexity-viz.png?branch=master
[ci-status]: http://travis-ci.org/#!/bahmutov/js-complexity-viz