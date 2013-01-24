var fs = require("fs");
var path = require("path");
var check = require('check-types');
var colors = require('colors');
var _ = require('lodash');
var Vector = require('gauss').Vector;

var json = /\.json$/i;

// output complexity report chart to file
function writeComplexityChart(metrics, filename) {
	// console.log(metrics);
	check.verifyString(filename, "output filename " + filename + " should be a string");
	log.debug("output report filename", filename);
	fs.writeFileSync(filename, JSON.stringify(metrics, null, 2), "utf-8");
	log.info("Saved metrics to", filename);
}

var Table = require('cli-table');
function makeTable(titles, rows, colorful, complexityLimit) {
	console.assert(Array.isArray(titles), "column titles should be an array, not", titles);
	console.assert(Array.isArray(rows), "rows should be an array, not", rows);
	complexityLimit = complexityLimit || 1000;
	console.assert(complexityLimit > 0, 'invalid complexity limit', complexityLimit);

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

	var complexityColumn = 2;
	if (colorful) {
		rows.forEach(function(row, index) {
			var complexity = row[complexityColumn];
			if (complexity > complexityLimit) {
				var redRow = row.map(function(cell) {
					return String(cell).bold.red;
				});
				rows[index] = redRow;
			}
		});
	}

	rows.forEach(function(row) {
		table.push(row);
	});

	return table;
}

function removeMatchingPrefixes(rows) {
	console.assert(Array.isArray(rows), 'expected array, not', JSON.stringify(rows));
	if (!rows.length) {
		return rows;
	}
	var column = 0;
	var commonPrefix = '';
	do {
		console.assert(typeof rows[0][column] === 'string', 
			'data in column cell', rows[0][column], 'should be a string');
		if (!rows[0][column].length) {
			break;
		}
		var firstLetter = rows[0][column][0];
		var firstLetterSame = rows.every(function (row) {
			return row[column][0] === firstLetter;
		});
		if (!firstLetterSame) {
			break;
		}
		commonPrefix += firstLetter;
		rows = rows.map(function (row) {
			row[column] = row[column].substr(1);
			return row;
		});
	} while (true);
	if (commonPrefix.length) {
		console.log(commonPrefix);
	}
	return rows;
}

function writeReportTables(options) {
	options = options || {};
	console.assert(Array.isArray(options.metrics), "metrics should be an array, not", options.metrics);
	console.assert(options.metrics.length >= 1, "invalid complexity length", options.metrics.length);

	if (options.metrics.length === 1) {
		log.log('nothing to report, empty complexity array');
		return;
	}

	// console.log(options.metrics);

	function getComplexityInfo() {
		var info = 'LOC - lines of code (logical)\n' +
			'Cyclomatic - McCabe complexity http://en.wikipedia.org/wiki/Cyclomatic_complexity\n' +
			'Halstead difficulty - http://en.wikipedia.org/wiki/Halstead_complexity_measures\n';
		return info;
	}

	var info = getComplexityInfo();
	check.verifyString(info, 'complexity info should be a string, not ' + info);
	if (options.minimal) {
		info = '';
	}

	var titles = options.metrics[0];
	var rows = options.metrics.slice(1);

	if (options.filename) {
		(function () {
			var table = makeTable(titles, rows, false);
			console.assert(table, 'could not make plain table');
			var reportFilename = options.filename.replace(json, ".txt");
			var text = table.toString() + '\n' + info;
			fs.writeFileSync(reportFilename, text, "utf-8");
			log.info("Saved report text", reportFilename);
		}());
	}

	(function () {
		log.debug('making table, colors?', options.colors, 'complexity limit', options.limit);
		var rowsNoPrefix = removeMatchingPrefixes(rows);
		var table = makeTable(titles, rowsNoPrefix, options.colors, options.limit);
		console.assert(table, 'could not make table, colors?', options.colors);
		var text = table.toString();
		if (info) {
			text += '\n' + info;
		}
		console.log(text);

		var complexities = _.pluck(rows, 2);
		var set = new Vector(complexities);
		console.log('Cyclomatic: min', set.min(), 'mean', set.mean().toFixed(1), 'max', set.max());

		complexities = _.pluck(rows, 3);
		set = new Vector(complexities);
		console.log('Halstead: min', set.min(), 'mean', set.mean().toFixed(1), 'max', set.max());
	}());
}

module.exports = {
	writeComplexityChart: writeComplexityChart,
	writeReportTables: writeReportTables
};