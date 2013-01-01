// process input command line arguments
(function(){
	var optimist = require("optimist");
	global.args = optimist.usage("Visualize JS files complexity.\nUsage: $0")
			.default({
				help: false,
				path: ["."],
				log: 1,
				report: "report.json",
				skip: [],
				sort: 2,
				colors: true,
				recursive: true,
				limit: 10
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
			.argv;

	if (args.h || args.help || args["?"]) {
		optimist.showHelp();
		console.log(args);
		process.exit(0);
	}
}());