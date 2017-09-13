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

function DatabaseManager() {
	// the information needed to make the connection to mysql, DOES NOT by default specify a database, just credentials to sign in
	var pool = mysql.createPool({
		host: databaseInformation[lit.HOST],
		user: databaseInformation[lit.USER],
		password: databaseInformation[lit.SECRET],
		connectionLimit: databaseInformation[lit.MAX_CONNECTIONS]
	});

    /** Queries the database by opening a connection and querying and then closes the connection and returns the response.
	 *
     * @param queryString: The sanitized query string from the query builder to be passed to the database
	 * @param ignoreFailure: whether or not to ignore query failures
     */
	this.query = function(queryString, ignoreFailure) {
		return new Promise(function(resolve, reject){
			pool.getConnection(function(err, connection) {
				if (err) {
					log.error(err.message);
					return reject(err);
				}

				connection.query(queryString, function(err, rows) {
					if (err && !ignoreFailure) {
						log.error(err.message);
						return reject(err);
					}

					logSQLIfRequired(queryString);

					connection.release();
					resolve(rows);
				});
			});
		})
	};

	this.useDB = function(DBName) {
		return new Promise(function(resolve) {
			pool = mysql.createPool({
				host: databaseInformation[lit.HOST],
				user: databaseInformation[lit.USER],
				password: databaseInformation[lit.SECRET],
				database: DBName,
				connectionLimit: databaseInformation[lit.MAX_CONNECTIONS]
			});
			resolve();
		});
	};

	function logSQLIfRequired(str) {
        if (shouldLogSQL)
            log.log('SQL.Trace: ' + str);
	}
}

module.exports = new DatabaseManager();