/*
** requestResponder.js
** Created by Michael Albinson 1/15/17
*
** requestResponder is a functional utility interface to process requests that require results from the database
** Essentially it is used to call down to other processes to remove logic from the expressServer file
*
* Implementations for handlers can be found in the handlers directory.
*/

"use strict";

var questionHandler = require('./handlers/questionHandler');
var listHandler = require('./handlers/listHandler');
var profileHandler = require('./handlers/profileHandler');
var newHandler = require('./handlers/newHandler');
var linkHandler = require('./handlers/linkHandler');
var classHandler = require('./handlers/classHandler');
var lit = require('./Literals.js');
var feedbackHandler = require('./handlers/feedbackHandler');



/** parseRequest(request)
 **
 **
 * @param request: the express request
 * @return {Promise}: Resolves the information necessary to fill in the page if successful,
 * rejects if there is an invalid request type or there is an error retrieving the information
 */
exports.parseRequest = function(request) {
	return new Promise(function(resolve, reject) {
		switch (request.body.requested) {
			case (lit.PROFILE):
                profileHandler.handle(request).then(function(info) {
					resolve(info);
				}, function(err) {
					reject(err);
				});
				break;
			case ("list"):
                listHandler.handle(request).then(function(info) {
					resolve(info);
				}, function(err) {
					reject(undefined);
				});
				break;
			case("question"):
                questionHandler.handle(request).then(function(info) {
					resolve(info);
				}, function(err) {
					reject(err);
				});
				break;
			case('new'):
                newHandler.handle(request).then(function(info) {
					resolve(info);
				}, function (err) {
					reject(err);
                });
				break;
			case('class'):
                classHandler.handle(request).then(function(info) {
                    resolve(info);
                }, function (err) {
                    reject(err);
                });
				break;
			case('link'):
                linkHandler.handle(request).then(function(info) {
                    resolve(info);
                }, function (err) {
                    reject(err);
                });
				break;
			case('feedback'):
				feedbackHandler.handle(request).then(function(info){
					resolve (info);
                }, function(err) {
                    reject(err);
                });
				break;
			default: // TODO: class, link
				reject("Invalid request type");
				break;
		}
	})	
};