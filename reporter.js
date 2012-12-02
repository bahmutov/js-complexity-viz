var fs = require("fs");
var path = require("path");
var check = require('check-types');

var json = /\.json$/i;

// output complexity report chart to file
function writeComplexityChart(metrics, filename) {
	check.verifyString(filename, "output filename " + filename + " should be a string");
	log.debug("output report filename", filename);
	fs.writeFileSync(filename, JSON.stringify(metrics, null, 2), "utf-8");
	log.info("Saved metrics to", filename);

	var htmlFilename = path.resolve(path.dirname(process.argv[1]), "test\\example_report.html");
	log.debug("template report path", htmlFilename);
	var out = fs.readFileSync(htmlFilename, "utf-8");

	filename = filename.replace(json, ".html");
	log.debug("output html report filename", filename);
	fs.writeFileSync(filename, out, "utf-8");
	log.info("Saved report html to", filename);
}

var Table = require('cli-table');
function makeTable(titles, rows, colorful) {
	console.assert(Array.isArray(titles), "column titles should be an array, not", titles);
	console.assert(Array.isArray(rows), "rows should be an array, not", rows);

	var table;
	if (colorful) {
		table = new Table({
			head: titles
		});
	} else {
		table = new Table({
			head: titles,
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

	rows.forEach(function(item) {
		table.push(item);
	})

	return table;
}

function writeReportTables(options) {
	options = options || {};
	console.assert(Array.isArray(options.metrics), "metrics should be an array, not", options.metrics);
	console.assert(options.metrics.length >= 1, "invalid complexity length", options.metrics.length);
	check.verifyString(options.filename, "output filename " + options.filename + " should be a string");
	if (options.metrics.length === 1) {
		log.warn('nothing to report, empty complexity array');
		return;
	}

	var titles = options.metrics[0];
	var rows = options.metrics.slice(1);
	(function () {
		var table = makeTable(titles, rows, false);
		console.assert(table, 'could not make plain table');
		var reportFilename = options.filename.replace(json, ".txt");
		fs.writeFileSync(reportFilename, table.toString(), "utf-8");
		log.info("Saved report text", reportFilename);
	}());

	(function () {
		var table = makeTable(titles, rows, options.colors);
		console.assert(table, 'could not make table, colors?', options.colors);
		console.log(table.toString());
	}());
}

module.exports = {
	writeComplexityChart: writeComplexityChart,
	writeReportTables: writeReportTables
};