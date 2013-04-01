#!/usr/bin/env node

var complexity = require('./src/js-complexity');
if (module.parent) {
	module.exports = complexity;
} else {
	var fs = require("fs");
	var path = require("path");
	var check = require('check-types');

	var arguments = require('./src/arguments').run();
	console.assert(arguments, 'could not find args structure');

	var logger = require('optional-color-logger');
	logger.init(arguments);

	console.assert(arguments.path, "empty path");
	if (!Array.isArray(arguments.path)) {
		arguments.path = [arguments.path];
	}
	if (!Array.isArray(arguments.skip)) {
		arguments.skip = [arguments.skip];
	}
	log.debug("looking for js files in folders", arguments.path);

	complexity.run({
		report: arguments.report,
		path: arguments.path,
		colors: arguments.colors,
		limit: arguments.limit,
		sort: arguments.sort,
		minimal: arguments.minimal,
		skip: arguments.skip
	});
}
