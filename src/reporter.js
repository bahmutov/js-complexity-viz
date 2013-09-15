var fs = require('fs');
var check = require('check-types');
var _ = require('lodash');
var Vector = require('gauss').Vector;
var removeMatchingPrefixes = require('./utils').removeMatchingPrefixes;

var json = /\.json$/i;

function getComplexityInfo() {
	var info = 'LOC - lines of code (logical, lower is better)\n' +
	'Cyclomatic - McCabe complexity (lower is better)\n\thttp://en.wikipedia.org/wiki/Cyclomatic_complexity\n' +
	'Halstead difficulty (lower is better)\n\thttp://en.wikipedia.org/wiki/Halstead_complexity_measures\n' +
	'maintainability (higher is better)\n\thttp://jscomplexity.org/complexity\n';
	return info;
}

function toNumber(value) {
	return +value;
}

// output complexity report chart to file
function writeComplexityChart(metrics, filename) {
	check.verifyArray(metrics, 'expected array of metrics');

	// transform array of arrays to object
	var o = {};
	metrics.slice(1).forEach(function (measured) {
		var filename = measured[0];
		var loc = measured[1];
		var cyclomatic = measured[2];
		var halstead = measured[3];
		o[filename] = {
			loc: toNumber(loc),
			cyclomatic: toNumber(cyclomatic),
			halstead: toNumber(halstead)
		};
	});

	check.verifyString(filename, 'output filename ' + filename + ' should be a string');
	log.debug('output report filename', filename);
	var data = JSON.stringify(o, null, 2);
	fs.writeFileSync(filename, data + '\n', 'utf-8');
	log.info('Saved metrics to', filename);
}

var Table = require('cli-table');
function makeTable(titles, rows, colorful, complexityLimit) {
	console.assert(Array.isArray(titles), 'column titles should be an array, not', titles);
	console.assert(Array.isArray(rows), 'rows should be an array, not', rows);

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
				'top': '-',
				'top-mid': '+',
				'top-left': '+',
				'top-right': '+',
				'bottom': '-',
				'bottom-mid': '+',
				'bottom-left': '+',
				'bottom-right': '+',
				'left': '|',
				'left-mid': '+',
				'mid': '-',
				'mid-mid': '+',
				'right': '|',
				'right-mid': '+'
			}
		});
	}

	var complexityColumn = 2;
	if (colorful) {
		rows.forEach(function (row, index) {
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

function writeReportTables(options) {
	options = options || {};
	console.assert(Array.isArray(options.metrics), 'metrics should be an array, not', options.metrics);
	console.assert(options.metrics.length >= 1, 'invalid complexity length', options.metrics.length);

	if (options.metrics.length === 1) {
		log.log('nothing to report, empty complexity array');
		return;
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
			var reportFilename = options.filename.replace(json, '.txt');
			var text = table.toString() + '\n' + info;
			fs.writeFileSync(reportFilename, text, 'utf-8');
			log.info('Saved report text', reportFilename);
		}());
	}

	(function () {
		log.debug('making table, colors?', options.colors, 'complexity limit', options.limit);

		// grab values BEFORE they are obscured by terminal colors
		// make sure values are numbers
		var complexities = _.pluck(rows, 2).map(toNumber);
		var halsteadComplexities = _.pluck(rows, 3).map(toNumber);

		var rowsNoPrefix = removeMatchingPrefixes(rows);
		var table = makeTable(titles, rowsNoPrefix, options.colors, options.limit);
		console.assert(table, 'could not make table, colors?', options.colors);
		var text = table.toString();
		if (info) {
			text += '\n' + info;
		}
		console.log(text);

		var set = new Vector(complexities);
		console.log('Cyclomatic: min', set.min(), 'mean', set.mean().toFixed(1), 'max', set.max());
		set = new Vector(halsteadComplexities);
		console.log('Halstead: min', set.min(), 'mean', set.mean().toFixed(1), 'max', set.max());
	}());
}

module.exports = {
	writeComplexityChart: writeComplexityChart,
	writeReportTables: writeReportTables,
	getComplexityInfo: getComplexityInfo
};