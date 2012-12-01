var fs = require("fs");
var path = require("path");
var check = require('check-types');

require('./arguments');
console.assert(global.args, 'could not find args structure');

var logger = require('optional-color-logger');
logger.init(args);

console.assert(args.path, "empty path");
if (!Array.isArray(args.path)) {
	var paths = [];
	paths.push(args.path);
	args.path = paths;
}
log.info("looking for js files in folders", args.path);

var json = /\.json$/i;
if (!args.report.match(json)) {
	log.error("output report filename", args.report, "is not json");
	process.exit(1);
}

var allJsFiles = require('./collector').collect(args.path);
console.assert(Array.isArray(allJsFiles), "collector has not returned array");

log.info("found", allJsFiles.length, "js files");
allJsFiles.forEach(function(filename) {
	console.log(filename);
});

var metrics = require('./metrics').computeMetrics(allJsFiles);
check.verifyArray(metrics, "complexity metrics not an array");
// first object - titles
console.assert(metrics.length === allJsFiles.length + 1, "output array size", metrics.length, "!== number of files", allJsFiles.length);

var reporter = require('./reporter');
reporter.writeComplexityChart(metrics, args.report);
reporter.writeReportTables({
	metrics: metrics,
	filename: args.report,
	colors: args.colors,
	limit: args.limit
});