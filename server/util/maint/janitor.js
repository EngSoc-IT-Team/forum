/*
** Janitor.js
** an ode to Dr. Jan Itor
** Created by Michael Albinson 1/7/17
*/

"use strict";

var config = require('../../config/config.json');

var generater = require('../IDGenerator.js');
var log = require('../log.js');
var events = require('events')
var serverSweeper = undefined; //require('./serverSweeper.js');

/*
** Janitor.js is the controlling object that "cleans up" server side things
** by ensuring that the database is not cluttered with references to things that don't exist
** and that reported things are properly hidden etc. It is capable of both being
** invoked for manual use and will (hopefully, at some point), be smart enough to do routine 
** maintainance on the server and database during times of low server load.

** Note that this utility could be very intensive depending 
*/

const refreshFiles = ['jquery', 'bootstrap', 'bootstrap-js'];
var numJanitors = 0;


exports.Janitor = function(isAutomated) {
	// every janitor gets an ID so we don't lose track of who does what
	this.id = numJanitors++;

	var emitter = new events.EventEmitter;
	var jobsCancelled = false;
	var automated = false;
	var jobs = [];
	const prefix = "JANITOR 0" + this.id + " here! - "


	log.log(prefix + "Let's get to work!");
	if (!isAutomated)
		log.log(prefix + "Starting up in manual mode!");
	else {
		automate();
	}

	/*
	** *** Non-automated functions ***
	**
	** These are functions that can be invoked in manual mode
	** 
	*/

	/* cleanUp()
	** Run full slate of cleaning functions
	*/
	this.cleanUp = function() {
		this.cleanDatabase();
		this.cleanUpPartOfDatabase();
	}

	/* cleanUpDatabase()
	** Run full slate of cleaning functions, both database and server
	*/
	this.cleanUpDatabase = function() {
		serverSweeper.sweepAll();
	}

	this.cleanUpPartOfDatabase = function(tableToClean) {
		serverSweeper.sweepTable(tableToClean);
	}

	this.freshDatabase = function() {
		if (config.isProduction)
			return log.error(prefix + "This function is not permitted in a production environment.");

	}

	/* cancelJob(job)
	** cancel a single job, multiple jobs, or all jobs currently being monitored by the janitor
	** Does NOT stop other automated jobs from getting kicked off
	** 
	** {job} the job as a string or an array of strings or empty if all jobs are to be cancelled
	** No returns
	*/
	this.cancelJob = function(job) {
		log.warn("JANITOR - Friendly reminder that cancelling a job can result in data loss and incomplete work!");
		if (!job)
			emitter.emit("cancelJanitorJob", "all");
		else
			emitter.emit("cancelJanitorJob", job);
	}

	/* cancelAutomation()
	** Cancels the automation of the janitor. If there are jobs happening, those jobs will finish, but the
	** janitor will no longer start new jobs
	**
	** No input arguements
	** No returns
	*/
	this.cancelAutomation = function() {
		stopAutomation();
	}

	/*
	** Janitor automation functions
	*/

	function automate() {
		// implement janitor automation
		// should be able to detect times of lower server load or can do a biweekly maintainance
		log.log(prefix + "Bzzrt, I am a roboJanitor -[o . o]-");
		log.log("you can call on me to do things but I will also do automated maintainance!");
		log.log(prefix + "I'm not very smart yet, but am working to get better! Let me know if any particular job takes forever!");
		automated = true;
	}

	function stopAutomation() {
		log.log(prefix + "Bzzrt, roboJanitor shutting down ~[o . o]~");
		automated = false;
		for (var job in jobs)
			clearTimeout(job);

	}

}
