var _ = require('lodash');
var check = require('check-types');
var clc = require('cli-color');

module.exports = Complexity;

function Complexity(metrics) {
	check.verifyObject(metrics, 'missing metrics');
	_.extend(this, metrics);
}

Complexity.prototype.getMaintainability = function() {
	return this.maintainability;
};

Complexity.prototype.basicInfo = function() {
	var c = this.aggregate.complexity;
	return 'loc: ' + c.sloc.physical +
		' cyclomatic: ' + c.cyclomatic +
		' halstead: ' + c.halstead.difficulty.toFixed(2) +
		' maintainability: ' + this.maintainability.toFixed(2);
};

Complexity.prototype.info = function() {
	var c = this.aggregate.complexity;
	var info = {
		loc: {
			value: c.sloc.logical
		},
		cyclomatic: {
			value: c.cyclomatic,
		},
		halstead: {
			value: c.halstead.difficulty,
		},
		maintainability: {
			value: this.maintainability,
			higherIsBetter: true
		}
	};
	return info;
};

var good = clc.greenBright;
var bad = clc.redBright;

function changeMessage(label, newValue, oldValue, precision, higherIsBetter) {
	check.verifyString(label, 'missing label');
	check.verifyNumber(newValue, 'new value should be a number');
	
	var msg = null;
	var diff = newValue - oldValue;
	var goodColor = (higherIsBetter ? bad : good);
	var badColor = (higherIsBetter ? good : bad);
	if (diff > 0) {
		msg = badColor(label + ': '  + newValue.toFixed(precision) + '(+' + diff.toFixed(precision) + ')');
	} else {
		msg = goodColor(label + ': ' + newValue.toFixed(precision) + '(' + diff.toFixed(precision) + ')');
	}
	return msg;
}

Complexity.prototype.compare = function(o, filename) {
	console.assert(o instanceof Complexity, 'invalid object to compare to', o);
	if (filename) {
		check.verifyString(filename, 'filename should be a string');
	}
	var info = this.info();
	check.verifyObject(info, 'missing info');
	var oi = o.info();
	check.verifyObject(oi, 'missing other info');

	var isBetter = info.maintainability.value >= oi.maintainability.value;

	var msg = '';
	if (filename) {
		msg = (isBetter ? good : bad)(filename + ' ');
	}
	var diff;

	msg += changeMessage('loc', info.loc.value, oi.loc.value);
	msg += ' ' + changeMessage('halstead', 
		info.halstead.value, 
		oi.halstead.value, 1);
	msg += ' ' + changeMessage('maintainability', 
		info.maintainability.value, 
		oi.maintainability.value, 1, true);
	if (info.maintainability.value !== oi.maintainability.value) {
		// do not print anything if things have not changed.
		console.log(msg);
	}
	return isBetter;
};