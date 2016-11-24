"use strict";

var express = require('express');
var path = require('path');
var cp = require('cookie-parser');
var bp = require('body-parser');
var log = require('./util/log');
var validator = require('./util/CookieValidator')
var compare = require('./util/Compare')

const PORT = 8080;
var server = express();

// directories from which we serve css, js and assets statically
server.use('/css', express.static('../client/css'));
server.use('/js', express.static('../client/js'));
server.use('/assets', express.static('../client/assets'));

// imports all the required middleware to express
server.use(cp("simplesecret")); //simple secret is an example password
server.use(bp.json());


server.get('/', function(request, response) { // default link, delivers landing page
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}

	response.sendFile(path.join(__dirname, '..', 'client/html/index.html'));
});

server.get('/search', function(request, response) { // to search bar
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}

	response.sendFile(path.join(__dirname, '..', 'client/html/index.html'));
});

server.get('/question/id=\*', function(request, response) { // question page, queried by id
	// validateSession(); // this needs to be at the beginning of every request
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}

	var pertinentQuery = request.url.replace('/question/id=', '');
	response.sendFile(path.join(__dirname, '..', 'client/html/Q_APage.HTML'));
});

server.get('/about', function(request, response) { //about page
	if (Object.keys(request.signedCookies).length === 0) {
		response.redirect('/login');
		return;
	}

	response.sendFile(path.join(__dirname, '..', 'client/html/about.HTML'));
});

server.get('/new', function(request, response) { // newest questions being asked in list view
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}
	response.send('<h2>A new post</h2><form><h3>Question</h3><input type="text"><br><h3>Tags</h3><input type="text"><br><br><input type="button" value="Submit"></form><h3>' + request.url + "</h3>");
});

server.get('/list', function(request, response) { //return the a default most recent list of questions
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}

	response.send('<h2>List view of questions</h2><br><h4>listItem</h4><br><h4>listItem</h4><br><h4>listItem</h4><br><h3>' + request.url + "</h3>");
});

server.get('/list/filter?\*', function(request, response) { //return the list filtered by the passed parameters, active search must route here ordered by most positive votes
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}

	response.send('<h2>List view of questions</h2><br><h4>listItem</h4><br><h4>listItem</h4><br><h4>listItem</h4><br><h3>' + request.url + "</h3>");
});

server.get('/profile', function(request, response) { //user home page
	if (compare.isEmpty(request.signedCookies)) {
		response.redirect('/login');
		return;
	}

	response.send('<h2>Home Page for the user currently logged in</h2><h3>' + request.url + "</h3>");
});

server.get('/login', function(request, response) { // mock login page
	if (compare.isEmpty(request.signedCookies)) {
		response.sendFile(path.join(__dirname, '..', 'client/html/login.html'));
		return;
	}
	else {
		response.redirect('/');
	}
});

server.post('/login', function(request, response) {
	if (!request.body){
		response.send(false);
		return;
	}

	validator.loginAndCreateSession(request.body).then(function(result) {
		response.cookie("usercookie", result, {signed: true});
    	response.send(true); // REDIRECT MUST OCCUR ON THE CLIENT AFTER A COOKIE IS SUCCESSFULLY SET

	}, function(result) {
		response.send(false);
	});
});


server.post('/logout', function(request, response) { // a place to post exclusively for logout requests
	if (compare.isEmpty(request.signedCookies)){
		response.redirect('/'); //then there's nothing to sign out of
		return;
	}

	if (request.body.logout == true) {
		validator.logout(request.signedCookies.usercookie).then(function(res) {
			response.clearCookie("usercookie");
			response.send(true);
		}, function(res) {
			response.send(false);
		});
	}
});

// start the server
server.listen(PORT);
log.info("Listening on port " + PORT.toString());
