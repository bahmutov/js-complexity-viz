var glob = require('glob');
var check = require('check-types');
var path = require('path');
var unary = require('allong.es').es.unary;

module.exports = sourceFiles;

function sourceFiles(files) {
	if (check.isString(files)) {
		files = [files];
	}
	check.verifyArray(files, 'expect list of filenames, not ' + JSON.stringify(files));

	var filenames = files.reduce(function (filenames, shortName) {
		var files = glob.sync(shortName);
		return filenames.concat(files);
	}, []);

	filenames = filenames.map(unary(path.resolve));
	return filenames;
}