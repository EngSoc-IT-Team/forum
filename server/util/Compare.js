/*
 * Compare.js
 * Written by Michael Albinson 11/24/16
 * I guess I needed this enough to turn it into its own interface?
 */

"use strict";

exports.isEmpty = function(testThis) {
	return (Object.keys(testThis).length === 0)
};