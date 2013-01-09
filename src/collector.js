var path = require("path");
var fs = require("fs");
var check = require('check-types');

function prepareExcludedFilenames(config) {
	config = config || {};
	if (!Array.isArray(config.skip)) {
		config.skip = [config.skip];
	}
	console.assert(Array.isArray(config.skip), 'expected skip to be an array');
	log.debug("preparing excluded paths", config.skip);
	config.skip.forEach(function(name, index) {
		var fullname = path.resolve(config.path, name);
		fullname = fullname.toLowerCase();
		config.skip[index] = fullname;
	});
	log.debug("excluded files", config.skip);
}

function isJsExcluded(filename, config) {
	check.verifyString(filename, 'filename should be a string, not ' + filename);
	console.assert(config, 'missing config');
	check.verifyArray(config.skip, "config.skip should be an array");
	if (!config.skip.length) {
		return false;
	}

	// assuming both files are lowercase
	var found = config.skip.some(function(name) {
		return filename === name;
	});
	return found;
}

var js = /\.js$/i;
var allJsFiles = {};

function checkFile(filename, config) {
	filename = filename.toLowerCase();

	if (filename.match(js)) {
		if (!isJsExcluded(filename, config)) {
			var fullPath = path.resolve(filename);
			allJsFiles[fullPath] = fullPath;
			// console.log('full path', fullPath);
		} else {
			log.debug("skipping file", filename);
		}
	} else {
		try {
			var stats = fs.lstatSync(filename);
			if (stats.isDirectory()) {
				if (!isJsExcluded(filename) && config.recursive) {
					collectJsFiles([filename], config);
				} else {
					log.debug("skipping folder", filename);
				}
			}
		}
		catch (e) {}
	}
}

function checkFolder(folder, config) {
	check.verifyString(folder, folder + " should be a string folder name");
	console.assert(config, 'missing config');

	var stats = fs.lstatSync(folder);
	if (!stats.isDirectory()) {
		// console.log(folder, 'is a filename');
		checkFile(folder, config);
		return;
	}

	var files = fs.readdirSync(folder);
	files.forEach(function(filename) {
		filename = path.resolve(folder, filename);
		checkFile(filename, config);
	});
}

function collectJsFiles(config) {
	console.assert(config, 'missing config');
	check.verifyArray(config.path, "expected list of files");
	log.debug('checking folders', config.path);

	config.path.forEach(function(folder) {
		var fullFolder = path.resolve(folder);
		checkFolder(fullFolder, config);
	});
}

module.exports = {
	collect: function(config) {
		console.assert(config, 'missing config');
		prepareExcludedFilenames(config);

		allJsFiles = {};
		collectJsFiles(config);
		return allJsFiles;
	}
};