var path = require('path');
var fs = require('fs');
var moment = require('moment');
var metrics = require('./metrics');
var optimist = require('optimist');
var Table = require('cli-table');
var check = require('check-types');

var getGitLog = require('ggit').log;
var getFileRevision = require('ggit').fileRevision;

var config = {
	filename: '',
	report: '',
	commits: 30
};

function run(options) {
	check.verifyObject(options, 'missing options');
	check.verifyString(options.filename, 'missing input filename');
	config.filename = options.filename;
	config.report = options.report || path.basename(options.filename) + '.complexityHistory.json';
	config.commits = options.commits || config.commits;
	getGitLog(options.filename, config.commits, 
		writeComplexityHistory.bind(null, options.filename));
}

function writeComplexityHistory(filename, commits) {
	check.verifyString(filename, 'missing filename');
	check.verifyArray(commits, 'expected commits');

	filename = filename.replace(/\\/g, '/');
	console.log('fetching revisions for', filename, 'for', commits.length, 'revisions');
	var titles = ['Date', 'LOC', 'Cyclomatic', 'Halstead', 'Author'];
	var rows = [];
	commits.forEach(function (revision) {
		getFileRevision(revision.commit, filename, function (contents) {
			var report = metrics.getSourceComplexity(contents);
			check.verifyObject(report, 'missing report for', filename, 'commit', revision.commit);

			rows.push([revision.date, 
				report.aggregate.complexity.sloc.logical,
				report.aggregate.complexity.cyclomatic, 
				+report.aggregate.complexity.halstead.difficulty.toFixed(0),
				revision.author,
				revision.description]);
			if (rows.length === commits.length) {
				writeComplexityReport(filename, titles, rows);
			}
		});
	});
}

function writeComplexityReport(filename, titles, rows) {
	check.verifyString(filename, 'expected filename');
	check.verifyArray(titles, 'expected titles array');
	check.verifyArray(rows, 'expected rows array');
	var comparison = function(a, b) {
		var first = a[0];
		var second = b[0];
		if (first < second) {
			return -1;
		} else if (first > second) {
			return 1;
		} else {
			return 0;
		}
	};
	rows.sort(comparison);
	rows = rows.map(function (row) {
		row[0] = row[0].format("YYYY/MM/DD HH:mm:ss");
		return row;
	});

	var table = new Table({
		head: titles
	});
	rows.forEach(function(row) {
		table.push(row.slice(0, 5));
	});
	console.log(table.toString());

	var report = rows.map(function (row) {
		return {
			date: row[0],
			loc: row[1],
			cyclomatic: row[2],
			halstead: row[3],
			author: row[4],
			description: row[5]
		};
	});
	var fileReport = {
		filename: filename,
		complexityHistory: report
	};
	fs.writeFileSync(config.report, JSON.stringify(fileReport, null, 2), "utf-8");
	console.log("Saved report text", config.report);
}

module.exports.run = run;