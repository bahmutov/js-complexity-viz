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
	var args = require('./src/arguments').run();
	console.assert(args, 'could not find args structure');

	var logger = require('optional-color-logger');
	logger.init(args);

	console.assert(args.path, 'empty path');
	if (!Array.isArray(args.path)) {
		args.path = [args.path];
	}
	if (!Array.isArray(args.skip)) {
		args.skip = [args.skip];
	}

	if (args.history > 0) {
		history({
			filename: args.path[0],
			report: args.report,
			commits: args.history
		});
	} else {
		complexity.run({
			report: args.report,
			path: args.path,
			colors: args.colors,
			limit: args.limit,
			sort: args.sort,
			minimal: args.minimal,
			skip: args.skip
		});
	}
}