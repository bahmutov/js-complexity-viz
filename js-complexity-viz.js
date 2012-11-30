var fs = require("fs");
var path = require("path");
var cr = require('complexity-report');
var check = require('check-types');

// process input command line arguments
(function(){
	var optimist = require("optimist");
	global.args = optimist.usage("Visualize JS files complexity.\nUsage: $0")
			.default({
				help: 0,
				path: ["."],
				log: 1,
				report: "report.json",
				skip: []
			}).alias('h', 'help').alias('p', 'path').alias('r', 'report').alias('s', 'skip')
			.string("path").string("report").string("skip")
			.describe("path", "input folder with JS files, use multiple if necessary")
			.describe("log", "logging level: 0 - debug, 1 - info")
			.describe("report", "name of the output report file")
			.describe("skip", "filename or folder to skip, use multiple time if necessary")
			.argv;

	if (args.h || args.help || args["?"]) {
		optimist.showHelp();
		process.exit(0);
	}
}());

// initialize logger
(function(){
	var log = require("custom-logger");
	var logMode = (typeof args.l === "number" ? args.l : 1);
	console.log("log mode", logMode);
	log["new"]({
		debug: { level: 0, event: "debug", color: "yellow" },
		log: { level: 1, event: "log" },
		info: { level: 1, event: "info" },
		warn: { level: 2, event: "warn", color: "orange" },
		error: { level: 3, event: "error", color: "red" }
	});
	log.config({
		level: logMode
	});
	global.log = log;
}());

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

(function prepareExcludedFilenames() {
	if (!Array.isArray(args.skip)) {
		args.skip = [args.skip];
	}
	log.debug("preparing excluded paths", args.skip);
	args.skip.forEach(function(name, index) {
		var fullname = path.resolve(args.path, name);
		fullname = fullname.toLowerCase();
		args.skip[index] = fullname;
	});
	log.debug("excluded files", args.skip);
}());

function isJsExcluded(filename) {
	check.verifyString(filename, 'filename should be a string, not ' + filename);
	check.verifyArray(args.skip, "args.skip should be an array");
	if (!args.skip.length) {
		return false;
	}

	// assuming both files are lowercase
	var found = args.skip.some(function(name) {
		return filename === name;
	});
	return found;
}

var js = /\.js$/i;
var allJsFiles = []; 
function collectJsFiles(folders) {
	check.verifyArray(folders, "folders " + folders + " is not an array");
	log.debug('checking folders', folders);

	folders.forEach(function(folder) {
		check.verifyString(folder, folder + " should be a string folder name");

		var files = fs.readdirSync(folder);
		files.forEach(function(filename) {
			filename = path.resolve(folder, filename);
			filename = filename.toLowerCase();

			if (filename.match(js)) {
				if (!isJsExcluded(filename)) {
					allJsFiles.push(filename);
				} else {
					log.info("skipping file", filename);
				}
			} else {
				try {
					var stats = fs.lstatSync(filename);
					if (stats.isDirectory()) {
						collectJsFiles([filename]);
					}
				}
				catch (e) {}
			}
		});
	});
}
collectJsFiles(args.path);
log.info("found", allJsFiles.length, "js files");
allJsFiles.forEach(function(filename) {
	console.log(filename);
});

// returns an array of metrics by file
function computeMetrics(filenames) {
	var complexityMetrics = [];
	filenames.forEach(function(filename) {
		var source = fs.readFileSync(filename, "utf-8");
		var report = cr.run(source);
		// console.log(filename, '\n', report);
		complexityMetrics.push({
			name: path.relative(args.path, filename),
			complexity: report
		});
	});

	var prettyjson = require('prettyjson');
	
	var metrics = [];
	complexityMetrics.forEach(function(metric) {
		metrics.push([
			metric.name,
			metric.complexity.aggregate.complexity.sloc.logical,
			metric.complexity.aggregate.complexity.cyclomatic,
			Math.round(metric.complexity.maintainability)
			]);
	});

	metrics.sort(function(a, b) {
		return a[2] < b[2];
	});

	var header = [["File", "LOC", "Cyclomatic", "Maintainability"]];
	return header.concat(metrics);
}

var metrics = computeMetrics(allJsFiles);
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
	var table = new Table({
		head: metrics[0]
	});

	metrics.slice(1).forEach(function(item) {
		table.push(item);
	})
	console.log(table.toString());
}());