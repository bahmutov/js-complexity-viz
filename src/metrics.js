var fs = require("fs");
var path = require("path");
var cr = require('complexity-report');
var check = require('check-types');

// returns an array of metrics by file
function computeMetrics(filenames, options) {
	options = options || {};
	options.sort = options.sort || 1;

	var source, report;
	var complexityMetrics = [];
	filenames.forEach(function(filename) {
		try {
			source = fs.readFileSync(filename, "utf-8");
			console.assert(source, 'could not get source from file', filename);
			try {
				report = cr.run(source);
			} catch (error) {
				if (/Line 1:/.test(error)) {
					console.log('First line in', filename, 'has problem, maybe it is # character?');
					var lines = source.split('\n');
					lines = lines.filter(function (line) {
						return (line[0] !== '#');
					});
					source = lines.join('\n');
					report = cr.run(source);
				}
			}
		}	catch (ex) {
			console.error('could not compute complexity for', filename, '\n', ex);
			report = {
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
		}
		complexityMetrics.push({
			name: filename,
			complexity: report
		});
	});

	var header = [["File", "LOC", "Cyclomatic", "Halstead difficulty"]];
	
	var metrics = [];
	complexityMetrics.forEach(function(metric) {
		// console.log(metric.complexity.aggregate.complexity);
		metrics.push([
			metric.name,
			metric.complexity.aggregate.complexity.sloc.logical,
			metric.complexity.aggregate.complexity.cyclomatic,
			Math.round(metric.complexity.aggregate.complexity.halstead.difficulty)
			]);
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

module.exports = {
	computeMetrics: computeMetrics
};