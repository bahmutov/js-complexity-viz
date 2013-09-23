#!/usr/bin/env node

var measure = require('./src/metrics');
var sourceFiles = require('./src/sourceFiles');
var complexityInfo = require('./src/reporter').getComplexityInfo;
var program = require('commander');
var package = require('./package.json');
var check = require('check-types');
var path = require('path');

var repoRevision = require('ggit').repoRevision;
var repoRoot = require('ggit').repoRoot;

program.version(package.version);
program._name = package.name;

program.command('help')
.description('show help and exit')
.action(function () {
	console.log('Complexity metrics:\n\n' + complexityInfo());
	program.help();
});

program.command('changes [filename]')
.description('analyze file complexity against Git repo version')
.option('-f, --filename [filename]', 'filename to analyze')
.action(function (filename, options) {
	filename = filename || options.filename;
	check.verifyString(filename, 'missing filename');
	var files = sourceFiles(filename);
	check.verifyArray(files, 'should get full filenames');
	if (!files.length) {
		console.log('not files found matching', filename);
		process.exit(0);
	}

	repoRoot(function (rootFolder) {
		var relativePaths = files.map(path.relative.bind(this, rootFolder));
		relativePaths.forEach(reportChange);
	});
});

if (process.argv.length === 2) {
	process.argv.push('help');
}
program.parse(process.argv);

function reportChange(filename) {
	check.verifyString(filename, 'missing filename');
	repoRevision(filename, function (contents) {
		check.verifyString(contents, 'could not get repo for', filename);
		var repoComplexity = measure.getSourceComplexity(contents, filename);
		var diskComplexity = measure.getFileComplexity(filename);
		diskComplexity.compare(repoComplexity, filename);
	});
}
