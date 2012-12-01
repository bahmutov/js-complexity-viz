var fs = require("fs");
var path = require("path");
var check = require('check-types');

require('./arguments');
console.assert(global.args, 'could not find args structure');

var logger = require('./logger');
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

// output complexity report
(function(){
	var filename = args.report;
	check.verifyString(filename, "output filename " + filename + " should be a string");
	log.debug("output report filename", filename);
	fs.writeFileSync(filename, JSON.stringify(metrics, null, 2), "utf-8");
	log.info("Saved metrics to", filename);

	filename = path.resolve(path.dirname(process.argv[1]), "test\\example_report.html");
	log.debug("template report path", filename);
	var out = fs.readFileSync(filename, "utf-8");

	filename = args.report.replace(json, ".html");
	log.debug("output html report filename", filename);
	fs.writeFileSync(filename, out, "utf-8");
	log.info("Saved report html to", filename);
}());

// output complexity to command line
(function() {
	console.assert(metrics.length >= 1, "invalid complexity length", metrics.length);
	if (metrics.length === 1) {
		log.warn('nothing to report, empty complexity array');
		return;
	}

	var Table = require('cli-table');
	function makeTable(colorful) {
		var table;
		if (colorful) {
			table = new Table({
				head: metrics[0]
			});
		} else {
			table = new Table({
				head: metrics[0],
				style: {
					compact: true, 
					'padding-left': 1, 
					'padding-right': 1
				},
				chars: {
	          'top': '-'
	        , 'top-mid': '+'
	        , 'top-left': '+'
	        , 'top-right': '+'
	        , 'bottom': '-'
	        , 'bottom-mid': '+'
	        , 'bottom-left': '+' 
	        , 'bottom-right': '+'
	        , 'left': '|'
	        , 'left-mid': '+'
	        , 'mid': '-'
	        , 'mid-mid': '+'
	        , 'right': '|'
	        , 'right-mid': '+'
	      }
			});
		}

		metrics.slice(1).forEach(function(item) {
			table.push(item);
		})

		return table;
	}

	(function () {
		var table = makeTable(false);
		console.assert(table, 'could not make plain table');
		var filename = args.report.replace(json, ".txt");
		fs.writeFileSync(filename, table.toString(), "utf-8");
		log.info("Saved report text", filename);
	}());

	(function () {
		var table = makeTable(args.colors);
		console.assert(table, 'could not make table, colors?', args.colors);
		console.log(table.toString());
	}());
}());