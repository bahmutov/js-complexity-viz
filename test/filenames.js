var js = /\.js$/i;

test("detect js file", function () {
	ok("foo.js".match(js), "foo.js is js file");
	ok("boo.js".match(js), "boo.js is js file");
	ok("js.js".match(js), "js.js is js file");
});

test("detect JS file", function () {
	ok("foo.JS".match(js), "foo.JS is js file");
	ok("boo.JS".match(js), "boo.JS is js file");
	ok("js.JS".match(js), "js.JS is js file");
});

test("not JS file", function () {
	ok(!"JS".match(js), "JS is NOT js file");
	ok(!"js".match(js), "js is NOT js file");
	ok(!"js.foo".match(js), "js.foo is NOT js file");
});

test("string comparison", function () {
	var a = 'c:\git\js-complexity-viz\test\filenames.js';
	var b = 'c:\git\js-complexity-viz\test\filenames.js';
	equal(a, b, "same names");
	ok(a === b, "same names using ===");
	ok(a == b, "same names using ==");
});