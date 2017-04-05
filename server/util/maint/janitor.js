/*
** Janitor.js
** an ode to Dr. Jan Itor
** Created by Michael Albinson 1/7/17
*/

"use strict";

var config = require('../../config/config.json');

var log = require('../log.js');
var events = require('events');
var serverSweeper = undefined; //require('./serverSweeper.js');

/*
** Janitor.js is the controlling object that "cleans up" server side things
** by ensuring that the database is not cluttered with references to things that don't exist
** and that reported things are properly hidden etc. It is capable of both being
** invoked for manual use and will (hopefully, at some point) be smart enough to do routine
** maintainance on the server and database during times of low server load.

** Note that this utility could be very intensive depending on how it is implemented and what jobs it is allowed to do
*/

// global number to keep track of how many janitors are out there, doing the good work they do
var numJanitors = 0;


/** Creates a new instance of the Janitor object. Janitors are used to manage jobs that take care of server maintenance
 * and repeatedly doing those tasks if the janitor is set to be automated. The janitor should be event-driven, and should
 * be capable of cancelling jobs being carried out "soft" by letting them complete first, or "hard" by forcing them to
 * stop mid-execution. Note that stopping jobs this way ("hard") can cause database issues and possibly data loss;
 *
 * @param isAutomated: whether or not the the janitor should be automated. If it is, the Janitor will complete jobs of
 * its own accord and repeat them over time unless the job is cancelled
 * @constructor
 */
exports.Janitor = function(isAutomated) {
	// every janitor gets an ID so we don't lose track of who does what
	this.id = numJanitors++;

	var emitter = new events.EventEmitter;
	var automated = false;
	var jobs = [];
	const prefix = "JANITOR 0" + this.id + " here! - ";

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
	};

	/* cleanUpDatabase()
	** Run full slate of cleaning functions, both database and server
	*/
	this.cleanUpDatabase = function() {
		serverSweeper.sweepAll();
	};

    /** Cleans up a specified 
	 *
     * @param tableToClean
     */
	this.cleanUpPartOfDatabase = function(tableToClean) {
		serverSweeper.sweepTable(tableToClean);
	};

    /**
	 * Experimental function to load a new database while the environment is running to make resetting the database easier
	 * Will NOT be able to add schema changes
     */
	this.freshDatabase = function() {
		if (config.isProduction)
			return log.error(prefix + "This function is not permitted in a production environment.");

	};

    /**
	 *
     * @param str: the string to log
     */
    this.log = function (str) {
        log.log(prefix + str);
    };

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
	};

	/* cancelAutomation()
	** Cancels the automation of the janitor. If there are jobs happening, those jobs will finish, but the
	** janitor will no longer start new jobs
	**
	** No input arguments
	** No returns
	*/
	this.cancelAutomation = function() {
		stopAutomation();
	};

	/*
	** Janitor automation functions
	*/

    /**
	 * Automates the janitor. While automated the janitor will perform tasks without
     */
	function automate() {
		// implement janitor automation
		// should be able to detect times of lower server load or can do a biweekly maintainance
		log.log(prefix + "Bzzrt, I am a roboJanitor -[o . o]-");
		log.log("you can call on me to do things but I will also do automated maintainance!");
		log.log(prefix + "I'm not very smart yet, but am working to get better! Let me know if any particular job takes forever!");
		automated = true;
	}

    /**
	 * Prevents the janitor
     */
	this.stopAutomation = function() {
		log.log(prefix + "Bzzrt, roboJanitor shutting down ~[o . o]~");
        log.log(prefix + "All jobs already begun will be finished before complete shutdown");
		automated = false;
		for (var job in jobs)
			clearTimeout(job);

	};

	// start up the janitor
    this.log("Let's get to work!");
    if (!isAutomated)
        this.log("Starting up in manual mode!");
    else
        automate();
};
