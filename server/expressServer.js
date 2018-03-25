"use strict";

require('./error');
require('./setup'); // sets up the database if required

var express = require('express');
var cp = require('cookie-parser');
var bp = require('body-parser');
var log = require('./util/log');
var validator = require('./util/Validator');
var compare = require('./util/Compare');
var Environment = require('./util/evalEnvironment').Environment;
var requestor = require('./util/requestResponder');
var action = require('./util/actionResponder');
var lit = require('./util/Literals.js');
var PM = require('./util/PropertyManager');

const PORT = PM.getConfigProperty(lit.config.PORT);
var server = express();

// directories from which we serve css, js and assets statically
server.use('/css', express.static('../client/css'));
server.use('/js', express.static('../client/js'));
server.use('/assets', express.static('../client/assets'));

// imports all the required middleware to express
server.use(cp(lit.sql.SIMPLE_SECRET)); //simple secret is an example password
server.use(bp.json());

var isInProduction = (PM.getConfigProperty(lit.config.PRODUCTION) === true);

// Set the templating engine to use Pug
server.set('views', '../client/views');
server.set('view engine', 'pug');

/* GET Requests
**
** These correspond to the urls you type into the browser and define the actions to be
** taken when something like http://localhost:8080/***** is typed in
** For instance typing http://localhost:8080 in will correspond to the server.get('/', ...)
** call, http://localhost:8080/search corresponds to the server.get('/search', ...) call etc
*/

server.get(lit.routes.ROOT, function(request, response) { // default link, delivers landing page
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN);

    response.render('index',{
        title: 'Home',
        scripts: ["index.js"],
        nav: "menuOnly"
    });
});

server.get(lit.routes.QUESTION, function(request, response) { // question page, queried by id
	if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

	validator.validateItemExistence(request).then(function() {
        response.render('question', {
            title: 'Question',
            scripts: ['templating.js', 'question.js', 'pulse.js']
        });
	}).catch(function() {
        response.render('notFound', {
            title: 'Not Found',
            scripts: ['notFound.js'],
            nav: "search"
        });
	});
});

server.get(lit.routes.ABOUT, function(request, response) { //about page
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

	response.render('about', {
        title: 'About',
        scripts: ['pulse.js'],
        nav: "search"
    });
});

server.get(lit.routes.NEW, function(request, response) { // place where new things can be added
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);
	response.render('new', {
        title: 'New Entry',
        scripts: ['new.js', 'pulse.js'],
        nav: "menuOnly"
    });
});

server.get(lit.routes.LIST, function(request, response) { //return the a default most recent list of questions
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

	response.render('list', {
        title: 'Questions',
        scripts: ['pulse.js', 'templating.js', 'list.js'],
        nav: "search"
    });
});

server.get(lit.routes.PROFILE, function(request, response) { //user home page
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

	if (!compare.isEmpty(request.query)) {
		validator.validateUser(request).then(function() {
			response.render('profile', {
                title: 'Profile',
                stylesheets: ['profile.css'],
                scripts: ['templating.js', 'profile.js', 'pulse.js'],
                nav: "search"
            });
		}, function() {
		    response.render('notFound', {
                title: 'Not Found',
                scripts: ['notFound.js'],
                nav: "search"
		    });
		});
	}
	else {
        response.render('profile', {
            title: 'Profile',
            stylesheets: ['profile.css'],
            scripts: ['templating.js', 'profile.js', 'pulse.js'],
            nav: "search"
        })
	}
});

server.get(lit.routes.LOGIN, function(request, response) {
	if (compare.isEmpty(request.signedCookies))
        response.render('login', {
            title: 'Login',
            scripts: ['login.js']
        });
	else
		response.redirect(request.query.redirect ? request.query.redirect : lit.routes.ROOT);
});

server.get(lit.routes.GUIDELINES, function(request, response) { // mock login page
	if (compare.isEmpty(request.signedCookies))
        response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);
	else
		response.render('guidelines', {
            title: 'Guidelines',
            nav: "search"
        });
});

server.get(lit.routes.DEV, function(request, response) {
	if (compare.isEmpty(request.signedCookies))
		response.redirect(lit.routes.LOGIN);
	else {
		validator.hasRole(request.signedCookies.usercookie.userID, lit.ADMIN).then(function() {
			response.render('dev', {
                title: 'Development',
                nav: "search"
            });
		}, function() {
            response.render('notFound', {
                title: 'Not Found',
                scripts: ['notFound.js'],
                nav: "search"
            })
		});
	}
});

server.get(lit.routes.EVAL, function(request, response) { //allows evaluation of server side code from the client
	if (compare.isEmpty(request.signedCookies))
		response.redirect(lit.routes.LOGIN);
	else {
		validator.hasRole(request.signedCookies.usercookie.userID, lit.ADMIN).then(function() {
			response.render('eval', {
                title: 'Evaluate',
                nav: "search"
            });
        }, function() {
              response.render('notFound', {
                  title: 'Not Found',
                  scripts: ['notFound.js'],
                  nav: "search"
              });
		});
	}
});

server.get(lit.routes.HELP, function(request, response) {
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

	response.render('help', {
        title: 'Help',
        scripts: ['pulse.js'],
        nav: "search"
    });
});

server.get(lit.routes.CLASS, function(request, response) {
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

    validator.validateItemExistence(request).then(function() {
        response.render('class', {
            title: 'Class',
            scripts: ['templating.js', 'class.js', 'pulse.js'],
            nav: "search"
        });
    }).catch(function() {
        response.render('notFound', {
            title: 'Not Found',
            scripts: ['notFound.js'],
            nav: "search"
        });
    });
});

server.get(lit.routes.LINK, function(request, response) {
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

    validator.validateItemExistence(request).then(function() {
        response.render('link', {
            title: 'Link',
            scripts: ['templating.js', 'link.js', 'pulse.js'],
            nav: "search"
        });
    }).catch(function() {
        response.render('notFound', {
            title: 'Not Found',
            scripts: ['notFound.js'],
            nav: "search"
        });
    });
});

server.get(lit.routes.SETTINGS, function(request, response) {
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

    response.render('settings', {
        title: 'Settings',
        scripts: ['pulse.js', 'templating.js', 'settings.js'],
        nav: "search"
    });
});

server.get(lit.routes.ADVANCED_SEARCH, function(request, response) {
    if (compare.isEmpty(request.signedCookies))
        return response.redirect(lit.routes.LOGIN + '?redirect=' + request.url);

    response.render('advanced', {
        title: 'Search',
        scripts: ['pulse.js', 'advanced.js'],
        nav: "search"
    });
});

/* POST Requests
**
** These are not directly accessible from the browser, but can be used by making a POST
** request to the corresponding link.
*/

server.post(lit.routes.LOGIN, function(request, response) {
	if (!request.body) {
		response.send(false);
		return;
	}

	validator.loginAndCreateSession(request.body).then(function(result) {
		response.cookie(lit.USER_COOKIE, result, {signed: true});
    	response.send(true); // REDIRECT MUST OCCUR ON THE CLIENT AFTER A COOKIE IS SUCCESSFULLY SET

	}, function() {
		response.send(false);
	}).catch(function(err) {
        log.error(err.message);
        response.status(500).send("Internal Error");
    });
});

server.post(lit.routes.EVAL, function(request, response) {
	if (compare.isEmpty(request.signedCookies))
		response.redirect(lit.routes.LOGIN);
	else {
		validator.hasRole(request.signedCookies.usercookie.userID, lit.ADMIN).then(function() {
			var env = new Environment(); // a new disposable execution environment
			env.execute(request.body.code).then(function(res) {
				response.send(res);

			}, function(err) {
				response.send(err);
			});
		}, function() {
			response.send("You are not authorized for this role");

		}).catch(function(err) {
            log.error(err.message);
            response.status(500).send("Internal Error");
        });
	}
});

server.post(lit.routes.LOGOUT, function(request, response) { // a place to post exclusively for logout requests
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect(lit.routes.LOGIN); //then there's nothing to sign out of
		return;
	}

	if (request.body.logout === true) {
		validator.logout(request.signedCookies.usercookie).then(function() {
			response.clearCookie(lit.USER_COOKIE);
			response.send(true);
		}, function() {
			response.send(false);
		}).catch(function(err) {
            log.error(err.message);
            response.status(500).send("Internal Error");
        });
	}
});

server.post(lit.routes.ACTION, function(request, response) {
	if (compare.isEmpty(request.signedCookies)){ // if not signed in, you can't vote
		response.redirect(lit.routes.LOGIN); //tell the client to tell the user they need to login
		return;
	}
	action.respond(request).then(function(res) {
        response.send(res);
	}, function(res) {
        response.send(res);
	}).catch(function(err) {
        log.error(err.message);
        response.status(500).send("Internal Error");
    });

});

server.post(lit.routes.INFO, function(request, response) {
	if (compare.isEmpty(request.signedCookies)) { //if you're not signed in you can't get information
		response.redirect(lit.routes.LOGIN); // tell them to log in
		return;
	}
	requestor.parseRequest(request).then(function(resultToReturn) {
		response.send(resultToReturn);

	}, function(err) {
		response.status(404).send({res: "not found", error: err});

	}).catch(function(err) {
        log.error(err);
        response.status(500).send(err);
    });
});

/* Use Links
**
** These are general purpose links used to catch server errors and requests that ask for
** links that do not exist
*/

server.use(function (err, req, res, next) { // catches URL errors
	log.error(err.stack);
	res.statusCode = 500;
    res.render('notFound', {
        title: 'Not Found',
        scripts: ['notFound.js'],
        nav: "search"
    });
});

server.use(function (req, res, next) { // returns 404s instead of cannot GET
    res.render('notFound', {
        title: 'Not Found',
        scripts: ['notFound.js'],
        nav: "search"
    });
});


// start the server
server.listen(PORT);
log.info("Listening on port " + PORT.toString());