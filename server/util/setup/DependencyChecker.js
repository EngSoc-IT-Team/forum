"use strict";

var log = require('../log');

const dependencies = ['mysql', 'express', 'path', 'fs']; //'client-session' might need to be added

exports.checkDependencies = function() {
	log.info("~~~~~~~~~~~~~~~~Module Check~~~~~~~~~~~~~~~~~");
	var modulesYouNeed = [];
	for (var i in dependencies) {
		try {
			var testrequire = require(dependencies[i])
			log.info("Cool, looks like the module " + dependencies[i] + " is already installed!")
		} catch (e) {
			log.warn("Uh oh, looks like you're missing the module " + dependencies[i]);
			modulesYouNeed.push(dependencies[i]);
		} 
	}
	
	logSummary(dependencies, modulesYouNeed);
	log.info("~~~~~~~~~~~~~~~End Module Check~~~~~~~~~~~~~~~~\n\n");
}

function logSummary(dependencyList, modulesNotInstalled) {
	log.info("~~~~~~~~~~~~~~~~~~~~Summary~~~~~~~~~~~~~~~~~~~");
	log.info((dependencyList.length - modulesNotInstalled.length) + "/" +dependencyList.length + " modules installed")

	if (modulesNotInstalled.length == 0) {
		log.info("You have all the modules necesary to run this service!")
		return true;
	}

	log.warn("You still need the module(s):\n");
	for(var mods in modulesNotInstalled) { 
		log.warn(modulesNotInstalled[mods] + "\n");
	}

	throw new Error("You can't run this service until all the modules are installed, check the previous module logs\n");
}