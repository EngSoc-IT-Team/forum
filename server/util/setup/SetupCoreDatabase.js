"use strict";

var fs = require('fs');
var db = require('../DatabaseManager.js');
var log = require('../log.js')

var possibleTypes = JSON.parse(fs.readFileSync('SQLDatatypes.json', 'utf8')) 
var defaults = JSON.parse(fs.readFileSync('defaultTables.json', 'utf8')) 

var dbm = new db.DatabaseManager();

function createTable(tableName, fields, numberTablesToCreate, numberCreated) { //TODO: make this more intelligent to match changes to defaultTables.json
	var keyCount = 0;
	var queryString = 'CREATE TABLE ' + tableName + ' (';

	for (var field in fields) {
		if(keyCount < Object.keys(fields).length-1) {
			queryString += field + ' ' + possibleTypes[fields[field]["type"]];
			if (fields[field]["default"])
				queryString += " DEFAULT '" + fields[field]["default"] + "'";

			if(fields[field]["primaryKey"])
				queryString += " PRIMARY KEY"

			queryString += ', ';
			keyCount++;
		}
		else {
			queryString += field + ' ' + possibleTypes[fields[field]["type"]];
			if (fields[field]["default"])
				queryString += " DEFAULT '" + fields[field]["default"] + "'";

			if(fields[field]["primaryKey"])
				queryString += " PRIMARY KEY"
			queryString += ')';
		}
	}

	dbm.query(queryString).then(function(){
		log.info("Table '" + defaults[prop]["tablename"] + "' created!");
		if (numberTablesToCreate == numberCreated)
			log.info("~~~~~~~~~~~~~~~End of Database Setup~~~~~~~~~~~~~~~~\n\n")
	}, function(err){
		log.warn("Table '" + tableName + "' not created! Likely due to a previously logged error")
		if (numberTablesToCreate == numberCreated)
			log.info("~~~~~~~~~~~~~~~End of Database Setup~~~~~~~~~~~~~~~~\n\n")
	});
}

exports.setupDatabase = function() { 
	log.info("~~~~~~~~~~~~~~Starting Database Setup~~~~~~~~~~~~~~~")

	var totalLength = Object.keys(defaults).length;
	var numCreated = 0;

	for (var prop in defaults) {
		numCreated++;
		createTable(defaults[prop]["tablename"], defaults[prop]["fields"], totalLength, numCreated);
	}
	
	
}