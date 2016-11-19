"use strict";

const dependencies = ['mysql', 'express']; //'client-session' might need to be added

exports.checkDependencies = function() {
	console.log("~~~~~~~~~~~~~~~Module Check~~~~~~~~~~~~~~~~");
	var modulesYouNeed = [];
	for (var i in dependencies) {
		try {
			var testrequire = require(dependencies[i])
			console.log("Cool, looks like the module " + dependencies[i] + " is already installed!")
		} catch (e) {
			console.log("Uh oh, looks like you're missing the module " + dependencies[i]);
			modulesYouNeed.push(dependencies[i]);
		} 
	}
	logSummary(dependencies, modulesYouNeed);
	console.log("~~~~~~~~~~~~~~~End Module Check~~~~~~~~~~~~~~~~\n\n");
}

function logSummary(dependencyList, modulesNotInstalled) {
	console.log("\n\n~~~~~~~~~~~Summary~~~~~~~~~~~");
	console.log((dependencyList.length - modulesNotInstalled.length) + "/" +dependencyList.length + " modules installed")

	if (modulesNotInstalled.length == 0) {
		console.log("You have all the modules necesary to run this service!")
		return true;
	}

	console.log("You still need the module(s):\n");
	for(var mods in modulesNotInstalled) { 
		console.log(modulesNotInstalled[mods] + "\n");
	}

	throw new Error("You can't run this service until all the modules are installed, check the previous module logs\n");
}