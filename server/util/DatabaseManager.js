"use strict";

var mysql = require('mysql');
var fs = require('fs');
var log = require('./log');

var databaseInformation = JSON.parse(fs.readFileSync('database.json', 'utf8')) 

exports.DatabaseManager = function() {
	var pool = mysql.createPool({
		host: databaseInformation['host'],
		user: databaseInformation['user'],
		password: databaseInformation['secret'],
		database: databaseInformation['database'],
		connectionLimit: databaseInformation['maxConnections']
	});

	this.query = function(queryString) {
		return new Promise(function(resolve, reject){
			pool.getConnection(function(err, connection) {
				if (err) {
					log.error(err.message);
					reject(err);
				}

				connection.query(queryString, function(err, rows, fields) {
					if (err) {
						reject(err);
						log.error(err.message);
						return;
					}

					connection.release();
					resolve(rows);
				});
			});
		})
	}
}