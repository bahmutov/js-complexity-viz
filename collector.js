var path = require("path");
var fs = require("fs");
var check = require('check-types');

(function prepareExcludedFilenames() {
	if (!Array.isArray(args.skip)) {
		args.skip = [args.skip];
	}
	log.debug("preparing excluded paths", args.skip);
	args.skip.forEach(function(name, index) {
		var fullname = path.resolve(args.path, name);
		fullname = fullname.toLowerCase();
		args.skip[index] = fullname;
	});
	log.debug("excluded files", args.skip);
}());

function isJsExcluded(filename) {
	check.verifyString(filename, 'filename should be a string, not ' + filename);
	check.verifyArray(args.skip, "args.skip should be an array");
	if (!args.skip.length) {
		return false;
	}

	// assuming both files are lowercase
	var found = args.skip.some(function(name) {
		return filename === name;
	});
	return found;
}

var js = /\.js$/i;
var allJsFiles = []; 
function collectJsFiles(folders) {
	check.verifyArray(folders, "folders " + folders + " is not an array");
	log.debug('checking folders', folders);

	folders.forEach(function(folder) {
		check.verifyString(folder, folder + " should be a string folder name");

		var files = fs.readdirSync(folder);
		files.forEach(function(filename) {
			filename = path.resolve(folder, filename);
			filename = filename.toLowerCase();

			if (filename.match(js)) {
				if (!isJsExcluded(filename)) {
					allJsFiles.push(filename);
				} else {
					log.debug("skipping file", filename);
				}
			} else {
				try {
					var stats = fs.lstatSync(filename);
					if (stats.isDirectory()) {
						if (!isJsExcluded(filename) && args.recursive) {
							collectJsFiles([filename]);
						} else {
							log.debug("skipping folder", filename);
						}
					}
				}
				catch (e) {}
			}
		});
	});
}

module.exports = {
	collect: function(folders) {
		collectJsFiles(folders);
		return allJsFiles;
	}
};