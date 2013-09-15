var optimist = require("optimist");
var args = optimist.string("skip").alias("skip", "s").argv;

console.log("arguments", args);