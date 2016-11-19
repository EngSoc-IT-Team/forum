"use strict";

var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var log = require('./log');

var databaseInformation = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config/database.json'), 'utf8')) 

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
					return reject(err);
				}

				connection.query(queryString, function(err, rows, fields) {
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
}