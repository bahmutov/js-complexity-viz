var fs = require("fs");
var path = require("path");
var cr = require('complexity-report');

var optimist = require("optimist");
var args = optimist.usage("Visualize JS files complexity.\nUsage: $0")
		.default({
			help: 0,
			path: ".",
			log: 1,
			report: "report.json",
			skip: []
		}).alias('h', 'help').alias('p', 'path').alias('r', 'report').alias('s', 'skip')
		.string("path").string("report").string("skip")
		.describe("path", "input folder with JS files")
		.describe("log", "logging level: 0 - debug, 1 - info")
		.describe("report", "name of the output report file")
		.describe("skip", "filename or folder to skip, use multiple time if necessary")
		.argv;

if (args.h || args.help || args["?"]) {
	optimist.showHelp();
	process.exit(0);
}

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

console.assert(args.path, "empty path");
log.info("looking for js files in folder", args.path);

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
	console.assert(Array.isArray(args.skip), "args.skip should be an array");

	// assuming both files are lowercase
	var found = false;
	args.skip.forEach(function(name) {
		if (filename === name) {
			found = true;
			return;
		}
	});
	return found;
}

var js = /\.js$/i;
var allJsFiles = []; 
function collectJsFiles(folder) {
	var files = fs.readdirSync(folder);
	files.forEach(function(filename) {
		if (filename.match(js)) {
			filename = path.resolve(folder, filename);
			filename = filename.toLowerCase();
			if (!isJsExcluded(filename)) {
				allJsFiles.push(filename);
			} else {
				log.info("skipping file", filename);
			}
		} else {
			try {
				var stats = fs.lstatSync(filename);
				if (stats.isDirectory()) {
					collectJsFiles(filename);
				}
			}
			catch (e) {}
		}
	});	
}
collectJsFiles(args.path);
log.debug("found", allJsFiles.length, "js files");
log.debug(allJsFiles);

var complexityMetrics = [];
allJsFiles.forEach(function(filename) {
	var source = fs.readFileSync(filename, "utf-8");
	var report = cr.run(source);
	// console.log(filename, '\n', report);
	complexityMetrics.push({
		name: path.relative(args.path, filename),
		complexity: report
	});
});

var prettyjson = require('prettyjson');
var out = [];
out.push(["File", "LOC", "Cyclomatic", "Maintainability"]);

complexityMetrics.forEach(function(metric) {
	out.push([
		metric.name,
		metric.complexity.aggregate.complexity.sloc.logical,
		metric.complexity.aggregate.complexity.cyclomatic,
		metric.complexity.maintainability
		]);
});
var filename = args.report;
log.debug("output report filename", filename);
fs.writeFileSync(filename, JSON.stringify(out, null, 2), "utf-8");
log.info("Saved metrics to", filename);

filename = path.resolve(path.dirname(process.argv[1]), "test\\example_report.html");
log.debug("template report path", filename);
out = fs.readFileSync(filename, "utf-8");


filename = args.report.replace(json, ".html");
log.debug("output html report filename", filename);
fs.writeFileSync(filename, out, "utf-8");
log.info("Saved report html to", filename);