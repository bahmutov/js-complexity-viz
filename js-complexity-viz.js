var fs = require("fs");
var path = require("path");
var check = require('check-types');

require('./arguments');
console.assert(global.args, 'could not find args structure');

var logger = require('optional-color-logger');
logger.init(args);

console.assert(args.path, "empty path");
if (!Array.isArray(args.path)) {
	args.path = [args.path];
}
log.debug("looking for js files in folders", args.path);

var complexity = require('./js-complexity');
complexity.run({
	report: args.report,
	path: args.path,
	colors: args.colors,
	limit: args.limit
});