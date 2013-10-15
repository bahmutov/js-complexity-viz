var check = require('check-types');
var collector = require('./collector');

if (!global.log) {
  global.log = console;
  global.log.debug = console.log;
}

// returns results object
function run(config) {
	config = config || {};
	config.limit = config.limit || 10;

	var json = /\.json$/i;
	if (config.report && !config.report.match(json)) {
		log.error('output report filename', config.report, 'is not json');
		process.exit(1);
	}

  if (check.isString(config.path)) {
    config.path = [config.path];
  }
	console.assert(Array.isArray(config.path), 'path should be a list of paths');
	// console.log('config.path', config.path);

	var allJsFiles = collector.collect(config);
	console.assert(typeof allJsFiles === 'object', 'collector has not returned an object');

	log.debug('found', Object.keys(allJsFiles).length, 'js files');
	if (log.level < 1) {
		Object.keys(allJsFiles).forEach(console.log);
	}

	var files = Object.keys(allJsFiles);
	var metrics = require('./metrics').computeMetrics(files, config);
	check.verifyArray(metrics, 'complexity metrics not an array');
  var results = arrayToMetrics(metrics);

	// first object - titles
	var filesN = files.length;
	console.assert(metrics.length === filesN + 1, 'output array size', metrics.length, '!== number of files', filesN);

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

  return results;
}

function arrayToMetrics(metrics) {
  check.verifyArray(metrics, 'expected metrics array');
  var results = [];
  metrics.forEach(function (line, index) {
    if (!index) {
      // skip first line
      return;
    }
    results.push({
      filename: line[0],
      loc: +line[1],
      cyclomatic: +line[2],
      difficulty: +line[3]
    });
  });
  return results;
}

module.exports = {
	run: run
};