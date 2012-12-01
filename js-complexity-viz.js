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
				skip: [],
				sort: 1,
				colors: true
			}).alias('h', 'help').alias('p', 'path').alias('r', 'report').alias('s', 'skip')
			.string("path").string("report").string("skip").boolean("colors")
			.describe("path", "input folder with JS files, use multiple if necessary")
			.describe("log", "logging level: 0 - debug, 1 - info")
			.describe("report", "name of the output report file")
			.describe("skip", "filename or folder to skip, use multiple time if necessary")
			.describe('sort', 'table column to sort on for command window output, reverse sorting using --sort !column')
			.describe('colors', 'use terminal colors for output, might not work with continuous build servers')
			.argv;

	if (args.h || args.help || args["?"]) {
		optimist.showHelp();
		process.exit(0);
	}
}());

// initialize logger
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
						if (!isJsExcluded(filename)) {
							collectJsFiles([filename]);
						} else {
							log.info("skipping folder", filename);
						}
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

	var header = [["File", "LOC", "Cyclomatic", "Maintainability"]];
	
	var metrics = [];
	complexityMetrics.forEach(function(metric) {
		metrics.push([
			metric.name,
			metric.complexity.aggregate.complexity.sloc.logical,
			metric.complexity.aggregate.complexity.cyclomatic,
			Math.round(metric.complexity.maintainability)
			]);
	});

	if (metrics.length > 0) {
		var sortingColumn = args.sort;
		var reverseSort = false;
		var comparison = function(a, b) {
			var first = a[sortingColumn];
			var second = b[sortingColumn];
			if (first < second) {
				return -1;
			} else if (first > second) {
				return 1;
			} else {
				return 0;
			}
		};
		if (/^!/.test(sortingColumn)) {
			sortingColumn = Number(sortingColumn.substr(1));
			reverseSort = true;
		}
		check.verifyNumber(sortingColumn, 'invalid sorting column ' + sortingColumn);
		var maxColumn = header[0].length;
		console.assert(sortingColumn >= 0 && sortingColumn < maxColumn, 'invalid sorting column', sortingColumn);
		log.debug('sorting metrics by column', sortingColumn);
		metrics.sort(comparison);
		if (reverseSort) {
			metrics.reverse();
		}
	}

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
	var table;
	if (args.colors) {
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
	console.log(table.toString());
}());