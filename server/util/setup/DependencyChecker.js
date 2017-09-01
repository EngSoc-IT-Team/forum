/*
* DependencyChecker.js
* Written by Michael Albinson 11/19/16
*
* Checks that all required dependencies have been installed.
 */

"use strict";

var log = require('../log');

const dependencies = ['mysql', 'express', 'path', 'fs', 'cookie-parser', 'body-parser', 'nodemailer',
	'nodemailer-smtp-transport', 'algorithmia', 'natural', 'pug'];

/**
 * Checks to make sure all the dependencies in the dependencies array exist in the execution environment
 * if they don't, warns the user telling them to install the required modules
 */
exports.checkDependencies = function() {
	log.info("~~~~~~~~~~~~~~~~Module Check~~~~~~~~~~~~~~~~~");
	var modulesYouNeed = [];
	for (var i in dependencies) {
		if (dependencies.hasOwnProperty(i)) {
            try {
                require(dependencies[i]);
                log.info("Cool, looks like the module " + dependencies[i] + " is already installed!")
            } catch (e) {
                log.warn("Uh oh, looks like you're missing the module " + dependencies[i]);
                modulesYouNeed.push(dependencies[i]);
            }
        }
	}
	
	logSummary(dependencies, modulesYouNeed);
	log.info("~~~~~~~~~~~~~~~End Module Check~~~~~~~~~~~~~~~~\n\n");
};

/** Logs the summary of the dependency check
 *
 * @param dependencyList: the list of dependencies the service relies on
 * @param modulesNotInstalled:
 * @returns {boolean}: returns true if all the modules are installed, throws an error to cancel all other execution if
 * not all of the modules are installed
 */
function logSummary(dependencyList, modulesNotInstalled) {
	log.info("~~~~~~~~~~~~~~~~~~~~Summary~~~~~~~~~~~~~~~~~~~");
	log.info((dependencyList.length - modulesNotInstalled.length) + "/" +dependencyList.length + " modules installed");

	if (modulesNotInstalled.length == 0) {
		log.info("You have all the modules necesary to run this service!");
		return true;
	}

	log.warn("You still need the module(s):\n");
	for(var mods in modulesNotInstalled) {
		if (modulesNotInstalled.hasOwnProperty(mods))
			log.warn(modulesNotInstalled[mods] + "\n");
	}

	throw new Error("You can't run this service until all the modules are installed, check the previous module logs\n");
}