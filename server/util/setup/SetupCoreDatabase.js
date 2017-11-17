/*
* SetupCoreDatabase.js
* Written by Michael Albinson 11/19/16
*
* Builds the database core database (must already have a database created in order for this to
* work.
 */

"use strict";

var fs = require('fs');
var path = require('path');
var dbm = require('../databaseUtil/DatabaseManager.js');
var dbr = require('../DBRow.js');
var log = require('../log.js');
var lit = require('../Literals.js');
var QEFError = require('../QEFError');

var possibleTypes = require('../../config/SQLDatatypes.json');
var defaults = require('../../config/defaultTables.json');
var demodata = require('../../config/mockData.json');
var databaseConfig = require('../../config/database.json');

var numCreated = 0;

/**
 * Creates the tables in defaultTables.json
 */
exports.setupDatabase = function() {
	return new Promise(function(resolve, reject) {
        log.info("~~~~~~~~~~~~~~Starting Database Table Creation~~~~~~~~~~~~~~~");

        var totalLength = Object.keys(defaults).length;
        numCreated = 0;

        for (var prop in defaults) {
            if (defaults.hasOwnProperty(prop))
                createTable(defaults[prop][lit.TABLE_NAME], defaults[prop][lit.FIELDS], totalLength, resolve, reject);
        }
	});
};

/**
 * Loads the demo data into the database
 */
exports.loadDemoData = function() {
	var loadref = {numComplete: 0};
	return new Promise(function(resolve, reject) {
        log.info("~~~~~~~~~~~~~~Loading Demo Data~~~~~~~~~~~~~~~");
        var totalLength = Object.keys(demodata).length;
        for (var element in demodata) {
            if (!demodata.hasOwnProperty(element))
                continue;

            loadRow(demodata[element][lit.TABLE], demodata[element], totalLength, loadref, resolve, reject);
        }
    });
};

/**
 *
 */
exports.checkIfDataBaseExistsAndCreateIfNecessary = function() {
	return new Promise(function(resolve, reject) {
		log.info('~~~~~~~~~~~~~~Creating Database ' + databaseConfig.database + '~~~~~~~~~~~~~~~');
		dbm.query('CREATE DATABASE IF NOT EXISTS ' + databaseConfig.database, true).then(function() {
			log.info('~~~~~~~~~~~~~~Database Creation Successful~~~~~~~~~~~~~~~\n\n');
			return dbm.useDB(databaseConfig.database);
		}).then(function() {
			resolve();
		}).catch(function(e) {
            log.error('FAILED TO CREATE OR USE DATABASE');
            log.error('USE THE SQL.Trace PROPERTY TO DETERMINE THE FAILURE REASON');
			reject(e);
		});
	});
};

/** Loads individual rows into database based upon the information found in mockData.json
 *
 * @param table: the table the new row is on
 * @param fields: the fields that need to be set to add the new table
 * @param numElementsToCreate: the number of new rows to load into the database
 */
function loadRow(table, fields, numElementsToCreate, numCreated, resolve) {
	var newRow = new dbr.DBRow(table);
	newRow.setId = false;
	for (var field in fields) {
        if (!fields.hasOwnProperty(field))
            continue;

		if (field === lit.TABLE)
			continue;

		newRow.addQuery(field, fields[field]);
	}

	var id = newRow.getValue(lit.fields.ID);

	newRow.insert().then(function() {
		log.info("Example row no. " +  numCreated.numComplete + " created!");
        numCreated.numComplete++;
		if (numElementsToCreate ===  numCreated.numComplete)
            log.info("~~~~~~~~~~~~~~~End of Demo Data Load~~~~~~~~~~~~~~~~\n\n");

        resolve();
	}, function() {
		log.warn("Row no. " +  numCreated.numComplete + " not inserted, likely due to a previously logged error");
		log.warn("The id of the failing row was '" + id + "'");
        numCreated.numComplete++;
		if (numElementsToCreate ===  numCreated.numComplete)
            log.info("~~~~~~~~~~~~~~~End of Demo Data Load~~~~~~~~~~~~~~~~\n");

        throw new QEFError();
	});
}

/** Creates the different tables for the database according to the defaultTables.json file
 *
 * @param tableName: name of the new table
 * @param fields: the fields that are a part of the new table
 * @param numberTablesToCreate: the number of tables that need to be created
 * @param resolve: resolve of the underlying Promise
 * @param reject: reject of the underlying promise
 */
function createTable(tableName, fields, numberTablesToCreate, resolve, reject) { //TODO: make this more intelligent to match changes to defaultTables.json
	var keyCount = 0;
	var queryString = 'CREATE TABLE ' + tableName + ' (';

	for (var field in fields) {
        if (!fields.hasOwnProperty(field))
            continue;

		if(keyCount < Object.keys(fields).length-1) {
			queryString += field + ' ' + possibleTypes[fields[field][lit.TYPE]];
			if (fields[field][lit.DEFAULT]) {
				if (fields[field][lit.DEFAULT] === 'CURRENT_TIMESTAMP' || fields[field][lit.DEFAULT] === 'GETDATE()') {
					queryString += " DEFAULT " + fields[field][lit.DEFAULT];
				}
				else {
					queryString += " DEFAULT '" + fields[field][lit.DEFAULT] + "'";
				}
			}

			if (fields[field][lit.PRIMARY_KEY])
				queryString += " PRIMARY KEY";

			if (fields[field]["constraint"])
				queryString += " " + fields[field]["constraint"];

			queryString += ', ';
			keyCount++;
		}
		else {
			if (!fields.hasOwnProperty(field))
				continue;

			queryString += field + ' ' + possibleTypes[fields[field][lit.TYPE]];
			if (fields[field][lit.DEFAULT]){ //make this better
				if (fields[field][lit.DEFAULT] === 'CURRENT_TIMESTAMP' || fields[field][lit.DEFAULT] === 'GETDATE()') {
					queryString += " DEFAULT " + fields[field][lit.DEFAULT];
				}
				else {
					queryString += " DEFAULT '" + fields[field][lit.DEFAULT] + "'";
				}
			}

			if (fields[field][lit.PRIMARY_KEY])
				queryString += " PRIMARY KEY";
			
			queryString += ')';
		}
	}

	dbm.query(queryString).then(function(){
		numCreated++;
		log.info("Table '" + tableName + "' created!");
		if (numberTablesToCreate === numCreated) {
			resolve();
            log.info("~~~~~~~~~~~~~~~End of Database Setup~~~~~~~~~~~~~~~~\n\n");
        }
	}, function() {
		numCreated++;
		log.warn("Table '" + tableName + "' not created! Likely due to a previously logged error");
		if (numberTablesToCreate === numCreated) {
			log.info("~~~~~~~~~~~~~~~End of Database Setup~~~~~~~~~~~~~~~~\n");
			throw new QEFError("Failure to create tables for database")
		}

	}).catch(function () {
        log.severe('THERE WAS AN ERROR DURING DATABASE SETUP');
        log.severe('PLEASE SEE THE ERROR LOGS FOR MORE INFORMATION');
    });
}