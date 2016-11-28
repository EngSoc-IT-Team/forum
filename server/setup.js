"use strict"

var dependencies = require('./util/setup/DependencyChecker.js');
var dbsetup = require('./util/setup/SetupCoreDatabase.js');
var dbr = require('./util/DBRow');
var log = require('./util/log');

var fs = require('fs');
var path = require('path');
var possibleTypes = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json'), 'utf8'));
var createDemoData = possibleTypes["createDemoData"];

dependencies.checkDependencies();
dbsetup.setupDatabase();
setTimeout(createSampleUser, 1000);

// this will be replaced by a full set of sample data
function createSampleUser() {
	if (createDemoData) {
		log.info("Creating demo data")
		var user = new dbr.DBRow('user');
		user.setValue("netid", "anon");
		user.setValue("id", "1234567890abcdefghijklmnopqrstuv");
		user.setValue("username", "anon");
		user.setValue("dateJoined", "2016-11-23");
		user.insert().then(function(res) {
			log.info("Sample user 'anon' sucessfully created")
		}, function(res) {
			log.error("There was an error inserting the sample data into the database, see above errors");
		})
	}
}
