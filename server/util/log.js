/*
 * log.js
 * Written by Michael Albinson 11/19/16
 *
 * Logging utility for the forum. Logs to the terminal if not in production.
 * Logs to a logfile if it is in production.
 */

"use strict";

var fs = require('fs');
var path = require('path');
var lit = require('./Literals.js');
var pm = require('./PropertyManager');

var isInProduction = pm.getConfigProperty(lit.PRODUCTION);

exports.log = function(logString) {
	var currentTime = _getTime();
	var logThis = currentTime + ": " + logString;
	if (isInProduction)
		writeToFile(logThis);
	else
		console.log(logThis);
};

exports.warn = function(logString) {
	var currentTime = _getTime();
	var logThis = currentTime + " WARNING: " + logString;
	if (isInProduction)
		writeToFile(logThis);
	else
		console.warn(logThis);
};

exports.error = function(logString) {
	var currentTime = _getTime();
	var logThis = currentTime + " ERROR: " + logString;
	if (isInProduction)
		writeToFile(logThis);
	else
		console.error(logThis);
};

exports.severe = function(logString) {
    var currentTime = _getTime();
    var logThis = currentTime + " ERROR: **SYSTEM SEVERE** " + logString;
    if (isInProduction)
        writeToFile(logThis);
    else
        console.error(logThis);
};

exports.info = function(logString) {
	var currentTime = _getTime();
	var logThis = currentTime + " INFO: " + logString;
	if (isInProduction)
		writeToFile(logThis);
	else
		console.log(logThis);
};

function writeToFile(logString) {
	var currentdate = new Date().toISOString();
	currentdate = currentdate.slice(0, currentdate.indexOf('T'));

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

function _getTime() {
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}