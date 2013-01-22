js-complexity-viz
=================

[![Build status][ci-image]][ci-status]

JavaScript source code complexity tool

This is a runner/wrapper around Phil Booth's tool [*complexity report*](https://github.com/philbooth/complexityReport.js "Complexity report at github")

Install and run
===============

	npm install js-complexity-viz
	node js-complexity-viz foo.js tests/*.js

Use -h option to see all (few) options

Outputs: 

1. *report.html* (based on template, uses Google charting library)
2. *report.json* (collected js file complexity statistics)

For example, the html can be ingested into Jenkins build system when using *HTML publisher plugin*

License
=======

The MIT License, see [*MIT-License.txt*](js-complexity-viz/blob/master/MIT-License.txt "MIT-License.txt")

Contact
=======

Gleb Bahmutov <gleb.bahmutov@gmail.com>

[ci-image]: https://secure.travis-ci.org/bahmutov/js-complexity-viz.png?branch=master
[ci-status]: http://travis-ci.org/#!/bahmutov/js-complexity-viz