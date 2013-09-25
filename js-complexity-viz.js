#!/usr/bin/env node

var complexity = require('./src/js-complexity');
/*
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
*/
if (module.parent) {
	module.exports = complexity;
} else {
	var updateNotifier = require('update-notifier');
	var notifier = updateNotifier();
	if (notifier.update) {
		notifier.notify();
	}

	var fs = require("fs");
	var path = require("path");
	var check = require('check-types');

	var arguments = require('./src/arguments').run();
	console.assert(arguments, 'could not find args structure');

	var logger = require('optional-color-logger');
	logger.init(arguments);

	console.assert(arguments.path, 'empty path');
	if (!Array.isArray(arguments.path)) {
		arguments.path = [arguments.path];
	}
	if (!Array.isArray(arguments.skip)) {
		arguments.skip = [arguments.skip];
	}
	log.debug('looking for js files in folders', arguments.path);

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