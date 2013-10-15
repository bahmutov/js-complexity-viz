var jsc = require('..');

var results = jsc.run({
  path: './external.js'
});

console.log('results', results);