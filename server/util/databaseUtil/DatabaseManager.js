/*
 * DatabaseManager.js
 * Written by Michael Albinson 11/19/16
 *
 * The interface object for working with the database
 */

"use strict";

var mysql = require('mysql');
var log = require('./../log');
var lit = require('./../Literals.js');
var pm = require('./../PropertyManager');

const databaseInformation = require('../../config/database.json');
const shouldLogSQL = pm.getConfigProperty('SQL.Trace');

function DatabaseManager() {
	var pool;

	if (pm.getConfigProperty(lit.config.DATABASE_TESTING) || !pm.getConfigProperty(lit.config.DATABASE_SETUP_NEEDED))
        pool = mysql.createPool({
            host: databaseInformation[lit.sql.HOST],
            user: databaseInformation[lit.sql.USER],
            password: databaseInformation[lit.sql.SECRET],
            database: databaseInformation[lit.sql.DATABASE],
            connectionLimit: databaseInformation[lit.sql.MAX_CONNECTIONS]
        });
	else
		pool = mysql.createPool({
			host: databaseInformation[lit.sql.HOST],
			user: databaseInformation[lit.sql.USER],
			password: databaseInformation[lit.sql.SECRET],
			connectionLimit: databaseInformation[lit.sql.MAX_CONNECTIONS]
		});

    /** Queries the database by opening a connection and querying and then closes the connection and returns the response.
	 *
     * @param queryString: The sanitized query string from the query builder to be passed to the database
	 * @param ignoreFailure: whether or not to ignore query failures
     */
	this.query = function(queryString, ignoreFailure) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, connection) {
				if (err) {
					log.error(err.message);
					return reject(err);
				}

				connection.query(queryString, function(err, rows) {
					if (err && !ignoreFailure) {
						log.error('SQL Error: ' + err.message);
                        log.error("The corresponding SQL was: " + queryString);
						return reject(err);
					}

                    logSQLIfRequired(queryString);

					connection.release();
					resolve(rows);
				});
			});
		});
	};

	this.useDB = function(DBName) {
		return new Promise(function(resolve, reject) {
			pool = mysql.createPool({
				host: databaseInformation[lit.sql.HOST],
				user: databaseInformation[lit.sql.USER],
				password: databaseInformation[lit.sql.SECRET],
				database: DBName,
				connectionLimit: databaseInformation[lit.sql.MAX_CONNECTIONS]
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