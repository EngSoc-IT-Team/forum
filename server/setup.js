/*
* Setup.js
* Written by Michael Albinson 11/19/16
*
* Setup routine to ensure the service can be run and building the core database.
 */

"use strict";

var dependencies = require('./util/setup/DependencyChecker.js');
var dbsetup = require('./util/setup/SetupCoreDatabase.js');
var log = require('./util/log');
var lit = require('./util/Literals.js');

var fs = require('fs');
var path = require('path');
var PM = require('./util/PropertyManager');


setup(); // let's set everything up

/**
 * Sets up the database (provided that one has already been created). Additionally, loads mock data if the preference is
 * set in the config/config.json folder
 */
function setup() {
	dependencies.checkDependencies();

    dbsetup.checkIfDataBaseExistsAndCreateIfNecessary().then(function() {
		if (PM.getConfigProperty(lit.DATABASE_SETUP_NEEDED))
        	return dbsetup.setupDatabase(); // setup all default tables

	}).then(function() {
		// only load demo data if the database schema has just been set up
		if (PM.getConfigProperty(lit.LOAD_MOCK_DATA) && PM.getConfigProperty(lit.DATABASE_SETUP_NEEDED))
			return dbsetup.loadDemoData();

	}).catch(function() {
		log.error('THERE WAS AN ERROR DURING DATABASE SETUP');
		log.error('PLEASE SEE THE ERROR LOGS FOR MORE INFORMATION');
	});
}

process.on('unhandledRejection', function(e) {
	console.log(e);
});