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
			report: "report.json",
			minimal: false
		}).alias('h', 'help').alias('p', 'path').alias('r', 'report').alias('s', 'skip')
		.boolean("colors")
		.alias('colors', 'color')
		.string("path").string("report").string("skip")
		.boolean('recursive').boolean('h')
		.describe('help', 'show usage help and exit')
		.describe("path", "input filename|folder with JS files, use multiple if necessary")
		.describe("log", "logging level: 0 - debug, 1 - info")
		.describe("report", "name of the output report file")
		.describe("skip", "filename or folder to skip, use multiple time if necessary")
		.describe('sort', 'table column to sort on for command window output, reverse sorting using --sort !column')
		.describe('colors', 'use terminal colors for output, might not work with continuous build servers')
		.describe('recursive', 'recurse into subfolders when looking for js files')
		.describe('limit', 'highlight files with cyclomatic complexity above limit')
		.alias('m', 'minimal').boolean('minimal').describe('minimal', 'minimal output')
		.argv;

	if (typeof args.path === 'string') {
		args.path = [args.path];
	}
	if (args.path.length === 0) {
		args.path = args._;
	}
	if (args.minimal) {
		args.log = 3;
	}

	if (args.path.length === 0  || args.h || args.help || args["?"]) {
		optimist.showHelp();
		console.log(args);
		process.exit(0);
	}
	return args;
};