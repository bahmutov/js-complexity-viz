// process input command line arguments
module.exports.run = function () {
	var optimist = require('optimist');
	args = optimist.usage('Visualize JS files complexity.\nUsage: $0')
		.default({
			help: false,
			path: [],
			skip: [],
			sort: 2,
			colors: true,
			recursive: true,
			limit: 15,
			log: 1,
			report: 'report.json',
			minimal: false,
			history: 0,
			version: false
		}).alias('h', 'help').alias('p', 'path').alias('r', 'report').alias('s', 'skip')
		.boolean('colors')
		.alias('colors', 'color')
		.string('path').string('report').string('skip')
		.boolean('recursive').boolean('h')
		.describe('help', 'show usage help and exit')
		.describe('path', 'input filename|folder with JS files, use quotes if using *')
		.describe('log', 'logging level: 0 - debug, 1 - info')
		.describe('report', 'name of the output report file')
		.describe('skip', 'filename or folder to skip, use multiple time if necessary')
		.describe('sort', 'sort by table column, use --sort !column to reverse')
		.describe('colors', 'use terminal colors for output')
		.describe('recursive', 'recurse into subfolders when looking for js files')
		.describe('limit', 'highlight files with cyclomatic complexity above limit')
		.alias('m', 'minimal').boolean('minimal').describe('minimal', 'minimal output')
		.describe('history', 'number of commits to use and show file complexity.')
		.boolean('version').describe('version', 'show version and exit')
		.argv;

	if (args.version) {
		var package = require('../package.json');
		console.log(package.name, 'by', package.author, 'version', package.version);
		process.exit(0);
	}

	if (typeof args.path === 'string') {
		args.path = [args.path];
	}
	if (args.path.length === 0) {
		args.path = args._;
	}
	if (args.minimal) {
		args.log = 3;
	}
	if (args.history === true) {
		args.history = 30;
	}
	if (args.path.length === 0  || args.h || args.help || args['?']) {
		optimist.showHelp();
		process.exit(0);
	}
	return args;
};