var remove = require('../src/utils').removeMatchingPrefixes;
gt.module('filename paths prefix');

gt.test('empty and short list', function (){
	gt.func(remove, 'remove is a function');
	gt.aequal(remove([]), [], 'returns empty list');
	gt.aequal(remove(['foo']), ['foo'], 'returns same list');
});

gt.test('remove nothing', function () {
	var list = [['foo'], ['bar'], ['zoo']];
	gt.aequal(remove(list), list, 'returns original list');
});

gt.test('removes nothing despite common', function () {
	var list = [['foo\\foo'], ['foobar'], ['foozoo']];
	var correct = [['foo\\foo'], ['foobar'], ['foozoo']];
	gt.aequal(remove(list), correct, 'returns same list');
});

gt.test('removes first folder', function () {
	var list = [['foo\\foo'], ['foo\\bar']];
	var correct = [['foo'], ['bar']];
	gt.aequal(remove(list), correct, 'returns list');
});

gt.test('removes two folders', function () {
	var list = [['foo\\bar\\foo'], ['foo\\bar\\zoo']];
	var correct = [['foo'], ['zoo']];
	gt.aequal(remove(list), correct, 'returns list');
});

gt.test('folder and file are different', function () {
	var list = [['foo\\'], ['foo']];
	var correct = [['foo\\'], ['foo']];
	gt.aequal(remove(list), correct, 'returns list');
});

gt.test('cannot remove because not a folder', function () {
	var list = [['foo\\bar'], ['foo']];
	var correct = [['foo\\bar'], ['foo']];
	gt.aequal(remove(list), correct, 'returns list');
});