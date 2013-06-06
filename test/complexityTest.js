var complexity = require('./complexityExample');
var Complexity = require('../src/Complexity');

gt.module('complexity as object');

gt.test('loaded json', function() {
	gt.defined(complexity, 'loaded complexity');
	gt.defined(complexity.aggregate, 'aggregate property');
	gt.number(complexity.maintainability, 'maintainability');
	gt.ok(complexity.maintainability > 0, 'maintainability is positive');
});

gt.test('make object', function() {
	gt.func(Complexity, 'Complexity is a function');
	var c = new Complexity(complexity);
	gt.object(c, 'created Complexity object');
	// console.log(c);
	gt.ok(c instanceof Complexity, 'correct constructor');
	gt.ok(c.maintainability > 0, 'correct property');
	gt.func(c.getMaintainability, 'has function');
	gt.equal(c.getMaintainability(), c.maintainability, 'returns correct value');
});

gt.test(function basicInfo() {
	var c = new Complexity(complexity);
	gt.func(c.basicInfo, 'basicInfo is a function');
	var str = c.basicInfo();
	console.log(str);
	gt.string(str, 'basic info returns string');
});