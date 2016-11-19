"use strict"

var fs = require('fs');
var path = require('path');

var config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config/config.json'), 'utf8'));

var loggingShouldOccur = (config["logging"] == 'true');

exports.log = function(logString) {
	var currentTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var logThis = currentTime + ": " + logString;
	console.log(logThis);
	if (loggingShouldOccur)
		writeToFile(logThis);
}

exports.warn = function(logString) {
	var currentTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var logThis = currentTime + " WARNING: " + logString;
	console.warn(logThis);
	if (loggingShouldOccur)
		writeToFile(logThis);
}

exports.error = function(logString) {
	var currentTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var logThis = currentTime + " ERROR: " + logString;
	console.error(logThis);
	if (loggingShouldOccur)
		writeToFile(logThis);
}

exports.info = function(logString) {
	var currentTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var logThis = currentTime + " INFO: " + logString;
	console.log(logThis);
	if (loggingShouldOccur)
		writeToFile(logThis);
}

function writeToFile(logString) {
	var currentdate = new Date().toISOString();
	var currentdate = currentdate.slice(0, currentdate.indexOf('T'));

	var logFileName = "logs/" + currentdate + ".txt";
	var logFilePath = path.join(__dirname, '..', logFileName);

	var correctedString = logString + "\n";
	fs.open(logFilePath, "a", function(err, fd) {
		if (err){
			fs.writeFile(logFilePath, correctedString, {"flag": "wx"}, function(err){
				if (err)
					console.log(err);
			});
			return;
		}

		fs.write(fd, correctedString, function(err) {
			if (err)
				console.log(err);
		});

		fs.close(fd, function(err){
			if (err)
				console.log(err);
		});
	});

}