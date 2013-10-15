var fs = require('fs');
// var path = require('path');
var cr = require('complexity-report');
var check = require('check-types');
var Complexity = require('./Complexity');

module.exports = {
	computeMetrics: computeMetrics,
	getSourceComplexity: getSourceComplexity,
	getFileComplexity: getFileComplexity
};

function getSourceComplexity(source) {
	check.verifyString(source, 'missing source');

	var report = {
		aggregate: {
			complexity: {
				sloc: {
					logical: 0
				},
				cyclomatic: 0,
				halstead: {
					difficulty: 0
				}
			}
		}
	};

	try {
		report = cr.run(source);
	} catch (error) {
    log.debug('problem computing complexity', error);
		if (/Line 1:/.test(error)) {
			var lines = source.split('\n');
			lines = lines.filter(function (line) {
				return (line[0] !== '#');
			});
			source = lines.join('\n');
			report = cr.run(source);
		}
	}

	var c = new Complexity(report);
	return c;
}

function getFileComplexity(filename) {
	check.verifyString(filename, 'missing filename');
	var source = fs.readFileSync(filename, 'utf-8');
	check.verifyString(source, 'could not get source from file', filename);
	var report = getSourceComplexity(source, filename);
	check.verifyObject(report, 'could not get complexity for', filename);
	return report;
}

// returns an array of metrics by file
function computeMetrics(filenames, options) {

	options = options || {};
	options.sort = options.sort || 1;

	var complexityMetrics = [];
	filenames.forEach(function(filename) {
    log.debug('computing complexity for', filename);
		var report = getFileComplexity(filename);

		complexityMetrics.push({
			name: filename,
			complexity: report
		});
	});

	var header = [['File', 'LOC', 'Cyclomatic', 'Halstead difficulty']];

	var metrics = [];
	complexityMetrics.forEach(function(metric) {
		try {
			metrics.push([
				metric.name,
				metric.complexity.aggregate.complexity.sloc.logical,
				metric.complexity.aggregate.complexity.cyclomatic,
				metric.complexity.aggregate.complexity.halstead.difficulty.toFixed(0)
				]);
		} catch (error) {
			console.error(error);
		}
	});

	if (metrics.length > 0) {
		var sortingColumn = options.sort;
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
