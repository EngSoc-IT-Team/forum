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

	eventListener.on(literals.sweeperCancelJob, function(jobs) {
		if (!jobs.includes(literals.sweep))
			return;

		cancelled = true;
	})

	this.sweepTable = function(table) {
		switch(table) {
			case (literals.userTable):
				userCleanup();
				break;
			case (literals.link):
				linkCleanup();
				break;
			case (literals.postTable):
				postCleanup();
				break;
			case (literals.commentTable):
				commentCleanup();
				break;
			case (literals.reportTable):
				reportCleanup();
				break;
			case (literals.tagTable):
				tagCleanup();
				break;
			case (literals.classTable):
				classCleanup();
				break;
			case (literals.sessionTable):
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
		var links = new DBRow(literals.link);
		links.query().then(function() {
			var href = "";

			while(links.next()){
				href = links.getValue(literals.link);
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