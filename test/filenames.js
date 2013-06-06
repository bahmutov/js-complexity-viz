gt.module('filename matching');

var js = /\.js$/i;

gt.test("detect js file", function () {
	gt.ok("foo.js".match(js), "foo.js is js file");
	gt.ok("boo.js".match(js), "boo.js is js file");
	gt.ok("js.js".match(js), "js.js is js file");
});

gt.test("detect JS file", function () {
	gt.ok("foo.JS".match(js), "foo.JS is js file");
	gt.ok("boo.JS".match(js), "boo.JS is js file");
	gt.ok("js.JS".match(js), "js.JS is js file");
});

gt.test("not JS file", function () {
	gt.ok(!"JS".match(js), "JS is NOT js file");
	gt.ok(!"js".match(js), "js is NOT js file");
	gt.ok(!"js.foo".match(js), "js.foo is NOT js file");
});

gt.test("string comparison", function () {
	var a = 'c:\git\js-complexity-viz\test\filenames.js';
	var b = 'c:\git\js-complexity-viz\test\filenames.js';
	gt.equal(a, b, "same names");
	gt.ok(a === b, "same names using ===");
	gt.ok(a == b, "same names using ==");
});