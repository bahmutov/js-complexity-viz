// initialize logger
function init(options) {
	options = options || {};

	var logMode = (typeof args.l === "number" ? args.l : 1);
	if (args.colors) {
		var log = require("custom-logger");
		console.log("log mode", logMode);
		log["new"]({
			debug: { level: 0, event: "debug", color: "yellow" },
			log: { level: 1, event: "log" },
			info: { level: 1, event: "info" },
			warn: { level: 2, event: "warn", color: "orange" },
			error: { level: 3, event: "error", color: "red" }
		});
		log.config({
			level: logMode
		});
		global.log = log;
	} else {
		global.log = console;
		function nothing() {}
		console.log('Logging without colors, log level', logMode);
		if (logMode < 1) {
			global.log.debug = function() {
				console.log('debug:', [].slice.call(arguments).join(' '));
			}
		} else {
			global.log.debug = nothing;
		}
		if (logMode < 2) {
			global.log.info = function() {
				console.log('info :', [].slice.call(arguments).join(' '));
			}
		} else {
			global.log.info = nothing;
		}
	}
}

module.exports = {
	init: init
};