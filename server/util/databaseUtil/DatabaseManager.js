/*
 * DatabaseManager.js
 * Written by Michael Albinson 11/19/16
 *
 * The interface for working with the
 */

"use strict";

var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var log = require('./../log');
var lit = require('./../Literals.js');
var pm = require('./../PropertyManager');

const databaseInformation = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config/database.json'), 'utf8'));
const shouldLogSQL = pm.getConfigProperty('SQL.Trace');

exports.DatabaseManager = function() {
	// the information needed to make the connection to the mySQL database
	var pool = mysql.createPool({
		host: databaseInformation[lit.HOST],
		user: databaseInformation[lit.USER],
		password: databaseInformation[lit.SECRET],
		database: databaseInformation[lit.DATABASE],
		connectionLimit: databaseInformation[lit.MAX_CONNECTIONS]
	});

    /** Queries the database by opening a connection and querying and then closes the connection and returns the response.
	 *
     * @param queryString: The sanitized query string from the query builder to be passed to the database
     */
	this.query = function(queryString) {
		return new Promise(function(resolve, reject){
			pool.getConnection(function(err, connection) {
				if (err) {
					log.error(err.message);
					return reject(err);
				}

				connection.query(queryString, function(err, rows) {
					if (err) {
						log.error(err.message);
						return reject(err);
					}

					if (shouldLogSQL)
						log.log('SQL.Trace: ' + queryString);

					connection.release();
					resolve(rows);
				});
			});
		})
	}
};