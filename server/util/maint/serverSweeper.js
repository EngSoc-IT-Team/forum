/*
** ServerSweeper
** Created by Michael Albinson 1/12/17
*/

"use strict";

/*
** ServerSweeper
**
** The sweeper object performs common operations on the databse to ensure that
** all
*/

var DBRow = require('../DBRow.js').DBRow;
var events = require('events');
var log = require('../log.js');
var literals = require('../StringLiterals.js');

exports.Sweeper = function() {

	var eventListener = new events.EventEmitter;
	var cancelled = false;

	eventListener.on(literals.SWEEPER_CANCEL_JOB, function(jobs) {
		if (!jobs.includes(literals.SWEEP))
			return;

		cancelled = true;
	})

	this.sweepTable = function(table) {
		switch(table) {
			case (literals.USER_TABLE):
				userCleanup();
				break;
			case (literals.LINK):
				linkCleanup();
				break;
			case (literals.POST_TABLE):
				postCleanup();
				break;
			case (literals.COMMENT_TABLE):
				commentCleanup();
				break;
			case (literals.REPORT_TABLE):
				reportCleanup();
				break;
			case (literals.TAG_TABLE):
				tagCleanup();
				break;
			case (literals.CLASS_TABLE):
				classCleanup();
				break;
			case (literals.SESSION_TABLE):
				sessionCleanup();
				break;
			default:
				log.warn('There is no cleanup routine defined for the table: "' + table + '" continuing happily.');

		}
	}

	this.sweepAllTables = function() {
		log.info("Starting full slate of database validations, server performance may be reduced for some time");
		classCleanup();
		commentCleanup();
		linkCleanup();
		postCleanup();
		reportCleanup();
		sessionCleanup();
		tagCleanup();
		userCleanup();
	}

	this.isCancelled = function() {
		return cancelled;
	}

	/*
	** Checks the user table to ensure that all users have the proper number of votes
	** and that no invalid users are permitted to do things they should not do
	*/
	function userCleanup() {

	}

	/*
	** Checks the link table to make sure links are still valid (lead to non-empty pages/404 errors)
	*/
	function linkCleanup() {
		var links = new DBRow(literals.LINK);
		links.query().then(function() {
			var href = "";

			while(links.next()){
				href = links.getValue(literals.LINK);
				var isValid = true;//test link using something
				if (isValid)
					continue;
				else
					links.delete().then(function() { //if it's not valid delete the current link

					}, function(err) {
						log.warn("The link " + href + " was unable to be deleted but is invalid, consider manually deleting the link.")
					})
			}

		}, function(err) {

		});
	}


}