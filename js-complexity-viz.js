#!/usr/bin/env node

var complexity = require('./src/js-complexity');
var metrics = require('./src/metrics');
var history = require('./src/history').run;

if (module.parent) {
	module.exports = {
		complexity: complexity,
		metrics: metrics
	};
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

	if (args.history > 0) {
		history({
			filename: arguments.path[0],
			report: arguments.report,
			commits: args.history
		});
	} else {
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
}