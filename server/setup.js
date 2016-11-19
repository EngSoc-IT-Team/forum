"use strict"

var dependencies = require('./util/setup/DependencyChecker.js');
var dbsetup = require('./util/setup/SetupCoreDatabase.js');

dependencies.checkDependencies();
dbsetup.setupDatabase();
