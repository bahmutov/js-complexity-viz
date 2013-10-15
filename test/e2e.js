var path = require('path');

gt.module('end 2 end tests');

gt.test('external use', function () {
  var complexity = require('../js-complexity-viz');
  gt.func(complexity.run, 'has run function');

  var results = complexity.run({
    path: [path.join(__dirname, 'e2e.js')]
  });
  gt.array(results, 'returned results');
  gt.equal(results.length, 1, 'there should be info about 1 file');
});

gt.test('external use, single file', function () {
  var complexity = require('../js-complexity-viz');
  gt.func(complexity.run, 'has run function');

  var results = complexity.run({
    path: path.join(__dirname, 'e2e.js')
  });
  gt.array(results, 'returned results');
  gt.equal(results.length, 1, 'there should be info about 1 file');
});