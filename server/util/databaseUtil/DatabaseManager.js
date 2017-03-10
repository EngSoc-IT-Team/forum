/*
 * DatabaseManager.js
 * Written by Michael Albinson 11/19/16
 *
 *
 */

"use strict";

var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var log = require('./../log');
var lit = require('./../Literals.js');

var databaseInformation = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config/database.json'), 'utf8'));

exports.DatabaseManager = function() {
	var pool = mysql.createPool({
		host: databaseInformation[lit.HOST],
		user: databaseInformation[lit.USER],
		password: databaseInformation[lit.SECRET],
		database: databaseInformation[lit.DATABASE],
		connectionLimit: databaseInformation[lit.MAX_CONNECTIONS]
	});

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

					connection.release();
					resolve(rows);
				});
			});
		})
	}
};