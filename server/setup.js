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
var preferences = JSON.parse(fs.readFileSync(path.join('./config/config.json'), 'utf8'));


setup(); // let's set everything up


function setup() {
	dependencies.checkDependencies();

	if (preferences[lit.DATABASE_SETUP_NEEDED])
		dbsetup.setupDatabase(); // setup all default tables

	if (preferences[lit.LOAD_MOCK_DATA])
		setTimeout(function() {dbsetup.loadDemoData()}, 1000); //wait for database to get set up before we try to insert mock data
}