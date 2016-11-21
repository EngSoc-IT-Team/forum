"use strict";

var express = require('express');
var path = require('path');
var cp = require('cookie-parser');
var log = require('./util/log');

const PORT = 8080;
var server = express();

// directories from which we serve css, js and assets statically
server.use('/css', express.static('../css'));
server.use('/js', express.static('../js'));
server.use('/assets', express.static('../assets'));

server.use(cp()); // imports all the cookie-parser middleware to express

server.get('/', function(request, response) { // default link, delivers landing page
	// validateSession(); // this needs to be at the beginning of every request
	response.sendFile(path.join(__dirname, '..', 'html/index.html'));
	response.cookie("the first cookie", "the value of my cookie")
});

server.get('/search', function(request, response) { // to search bar
	// validateSession(); // this needs to be at the beginning of every request
	response.sendFile(path.join(__dirname, '..', 'html/index.html'));
});

server.get('/question/id=\*', function(request, response) { // question page, queried by id
	// validateSession(); // this needs to be at the beginning of every request
	var pertinentQuery = request.url.replace('/question/id=', '');
	response.sendFile(path.join(__dirname, '..', 'html/Q_APage.HTML'));
});

server.get('/about', function(request, response) { //about page
	response.sendFile(path.join(__dirname, '..', 'html/about.HTML'));
})

server.get('/new', function(request, response) { // newest questions being asked in list view
	// validateSession(); // this needs to be at the beginning of every request
	response.send('<h2>A new post</h2><form><h3>Question</h3><input type="text"><br><h3>Tags</h3><input type="text"><br><br><input type="button" value="Submit"></form><h3>' + request.url + "</h3>");
})

server.get('/list', function(request, response) { //return the a default most recent list of questions
	// validateSession(); // this needs to be at the beginning of every request
	response.send('<h2>List view of questions</h2><br><h4>listItem</h4><br><h4>listItem</h4><br><h4>listItem</h4><br><h3>' + request.url + "</h3>");
})

server.get('/list/filter?\*', function(request, response) { //return the list filtered by the passed parameters, active search must route here ordered by most positive votes
	// validateSession(); // this needs to be at the beginning of every request
	response.send('<h2>List view of questions</h2><br><h4>listItem</h4><br><h4>listItem</h4><br><h4>listItem</h4><br><h3>' + request.url + "</h3>");
})

server.get('/profile', function(request, response) { //user home page
	// validateSession(); // this needs to be at the beginning of every request
	response.send('<h2>Home Page for the user currently logged in</h2><h3>' + request.url + "</h3>");
})

// start the server
server.listen(PORT);
log.info("Listening on port " + PORT.toString());