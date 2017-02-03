"use strict"

var dependencies = require('./util/setup/DependencyChecker.js');
var dbsetup = require('./util/setup/SetupCoreDatabase.js');
var dbr = require('./util/DBRow');
var log = require('./util/log');
var literals = require('./util/StringLiterals.js');

var fs = require('fs');
var path = require('path');
var preferences = JSON.parse(fs.readFileSync(path.join('./config/config.json'), 'utf8'));


setup(); // let's set everything up


function setup() {
	dependencies.checkDependencies();

	if (preferences[literals.databaseSetupNeeded])
		dbsetup.setupDatabase(); // setup all default tables

	if (preferences[literals.loadMockData])
		setTimeout(function() {dbsetup.loadDemoData()}, 1000); //wait for database to get set up before we try to insert mock data
}