var fs = require("fs");
var path = require("path");
var cr = require('complexity-report');
var check = require('check-types');

// returns an array of metrics by file
function computeMetrics(filenames, options) {
	options = options || {};
	options.sort = options.sort || 1;

	var complexityMetrics = [];
	filenames.forEach(function(filename) {
		var source = fs.readFileSync(filename, "utf-8");
		var report = cr.run(source);
		// console.log(filename, '\n', report);
		complexityMetrics.push({
			// name: path.relative(args.path, filename),
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