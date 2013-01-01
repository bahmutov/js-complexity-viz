var fs = require("fs");
var path = require("path");
var check = require('check-types');

require('./arguments');
console.assert(global.args, 'could not find args structure');

var logger = require('optional-color-logger');
logger.init(args);

console.assert(args.path, "empty path");
if (!Array.isArray(args.path)) {
	args.path = [args.path];
}
log.debug("looking for js files in folders", args.path);

var json = /\.json$/i;
if (!args.report.match(json)) {
	log.error("output report filename", args.report, "is not json");
	process.exit(1);
}

var allJsFiles = require('./collector').collect(args.path);
console.assert(typeof allJsFiles === 'object', "collector has not returned an object");

log.debug("found", Object.keys(allJsFiles).length, "js files");
if (log.level < 1) {
	Object.keys(allJsFiles).forEach(function(filename) {
		console.log(filename);
	});
}

var files = Object.keys(allJsFiles);
var metrics = require('./metrics').computeMetrics(files);
check.verifyArray(metrics, "complexity metrics not an array");

// first object - titles
var filesN = files.length;
console.assert(metrics.length === filesN + 1, "output array size", metrics.length, "!== number of files", filesN);

var reporter = require('./reporter');
reporter.writeComplexityChart(metrics, args.report);
reporter.writeReportTables({
	metrics: metrics,
	filename: args.report,
	colors: args.colors,
	limit: args.limit
});