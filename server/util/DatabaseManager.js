"use strict";

var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var log = require('./log');
var literals = require('./StringLiterals.js');

var databaseInformation = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config/database.json'), 'utf8')) 

exports.DatabaseManager = function() {
	var pool = mysql.createPool({
		host: databaseInformation[literals.HOST],
		user: databaseInformation[literals.USER],
		password: databaseInformation[literals.SECRET],
		database: databaseInformation[literals.DATABASE],
		connectionLimit: databaseInformation[literals.MAX_CONNECTIONS]
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