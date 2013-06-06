var check = require('check-types');
var measure = require('./metrics');
var repoRevision = require('ggit').repoRevision;
var path = require('path');

function showChange(filename) {
	check.verifyString(filename, 'missing filename');
	repoRevision(filename, function(contents) {
		check.verifyString(contents, 'could not get repo for', filename);
		var repoComplexity = measure.getSourceComplexity(contents, filename);
		var diskComplexity = measure.getFileComplexity(filename);
		diskComplexity.compare(repoComplexity, filename);
	});
}

function showChanges(rootFolder, files) {
	check.verifyArray(files, 'should get full filenames');
	if (!files.length) {
		console.log('no files to report.');
		process.exit(0);
	}

	var relativePaths = files.map(path.relative.bind(null, rootFolder));
	relativePaths.forEach(showChange);
}

module.exports = {
	showChange: showChange,
	showChanges: showChanges
};