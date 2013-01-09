var check = require('check-types');
var collector = require('./collector');

function run(config) {
	config = config || {};
	config.limit = config.limit || 10;

	var json = /\.json$/i;
	if (config.report && !config.report.match(json)) {
		log.error("output report filename", config.report, "is not json");
		process.exit(1);
	}

	console.assert(Array.isArray(config.path), 'path should be a list of paths');

	var allJsFiles = collector.collect(config);
	console.assert(typeof allJsFiles === 'object', "collector has not returned an object");
	
	log.debug("found", Object.keys(allJsFiles).length, "js files");
	if (log.level < 1) {
		Object.keys(allJsFiles).forEach(function(filename) {
			console.log(filename);
		});
	}

	var files = Object.keys(allJsFiles);
	var metrics = require('./metrics').computeMetrics(files, config);
	check.verifyArray(metrics, "complexity metrics not an array");

	// first object - titles
	var filesN = files.length;
	console.assert(metrics.length === filesN + 1, "output array size", metrics.length, "!== number of files", filesN);

	var reporter = require('./reporter');
	if (config.report) {
		reporter.writeComplexityChart(metrics, config.report);
	}
	reporter.writeReportTables({
		metrics: metrics,
		filename: config.report,
		colors: config.colors,
		limit: config.limit,
		minimal: config.minimal
	});
}

module.exports = {
	run: run
};