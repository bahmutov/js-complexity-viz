var check = require('check-types');
var path = require('path');

// assuming correct path separators, removes only folders
module.exports.removeMatchingPrefixes = function (rows) {
	check.verifyArray(rows, 'expected array, not', JSON.stringify(rows));
	if (rows.length < 2) {
		return rows;
	}
	var column = 0;
	rows.forEach(function (row) {
		check.verifyArray(row, 'expected row to be an array', row);
		check.verifyString(row[column], 'data in column cell', 
			row[column], 'should be a string');
	});
	var parts = rows[0][column].split(path.sep);
	// console.log('sep', path.sep, 'parts', parts);
	if (parts.length < 2) {
		return rows;
	}
	
	var commonPrefix = '';
	parts.every(function (part) {
		var prefix = commonPrefix + part + path.sep;
		var partIsCommon = rows.every(function (row) {
			return !row[column].indexOf(prefix);
		});
		
		if (partIsCommon) {
			commonPrefix = prefix;
			// console.log('all values start with', commonPrefix);
			return true;
		} else {
			return false;
		}
	});
	
	// console.log('found common prefix', commonPrefix);
	if (commonPrefix.length) {
		console.log(commonPrefix);
		rows = rows.map(function (row) {
			row[column] = row[column].substr(commonPrefix.length);
			return row;
		});
	}
	return rows;
};

// removes letter by letter without looking at path parts
module.exports.removePrefixLetters = function (rows) {
	check.verifyArray(rows, 'expected array, not', JSON.stringify(rows));
	if (rows.length < 2) {
		return rows;
	}
	rows.forEach(function (row) {
		check.verifyArray(row, 'expected row to be an array', row);
	});
	
	var column = 0;
	var commonPrefix = '';
	
	do {
		check.verifyString(rows[0][column], 'data in column cell', 
			rows[0][column], 'should be a string');
		if (!rows[0][column].length) {
			break;
		}
		var firstLetter = rows[0][column][0];
		
		var firstLetterSame = rows.every(function (row) {
			return row[column][0] === firstLetter;
		});
		if (!firstLetterSame) {
			break;
		}
		commonPrefix += firstLetter;
		
		rows = rows.map(function (row) {
			row[column] = row[column].substr(1);
			return row;
		});
	} while (true);
	if (commonPrefix.length) {
		console.log(commonPrefix);
	}
	return rows;
};