/*
** Created by Michael Albinson 11/9/16
*/

"use strict";
var DBRow = require('../util/DBRow').DBRow;
var generator = require('../util/Generator');
var lit = require('../util/Literals.js');
var recursion = require('../util/recursion');
var itemInfo = require('../util/handlers/itemInfoGetter');

/* A series of basic functions to help get your head around using the DBRow object
** each should be fairly self explanatory, but if there are questions let me know
** To run a function to try it out just copy its call somewhere in this document and run this file.
*/

// add a function here to see what it does

/* getARowExample()
**
** Shows how to use the getRow() method of DBRow. The getRow() method relies on an id to
** return a row immediately. All other query parameters add using addQuery() before calling getRow()
** are ignored. After we call getRow(), the row object then contains the object we got back from the
** database. If we were successful, there will be exactly one row.
**
** NOTE: if the get call does not get a row back because the id doesn't match anything on the table,
** the promise is NOT rejected. It is your job to make sure that the row is there before you start trying
** to do work with it.
*/
function getARowExample() {
	var row = new DBRow(lit.tables.USER);
	row.getRow('c1t58gst8anhdpfe54h2fpiq9xvh7gy0').then(function() {
		if (row.count() < 1) //an example of how to make sure you have a row when you use getRow()
			return console.log("this means we didn't get a row back!");

		console.log(row.getValue(lit.fields.NETID));
		console.log(row.getValue(lit.fields.USERNAME));
		// other code

	}, function(err) {
		console.log("error getting the row");
		//other code

	})
}

/* insertARowExample()
**
** Shows how to use the insert() method of DBRow. In order to set information we use the
** setValue() method of DBRow and then once we are happy with the information,
** we can call insert(). It will resolve true if it is successful, false if it fails.
** It will only reject if there is an error in the database.
*/
function insertARowExample() {
	var newRow = new DBRow(lit.tables.VOTE);
	var userID = generator.generate();
	var voteID = generator.generate();
	newRow.setValue(lit.fields.VOTE_VALUE, lit.ZERO); // insert vote with vote value -1
	newRow.setValue(lit.fields.ITEM_ID, generator.generate());
	newRow.setValue(lit.fields.USER_ID, userID);
	newRow.setValue(lit.fields.ID, voteID);

	newRow.insert().then(function() { // if we resolve the promise we go here
		console.log("insert was successful");

		//other code

	}, function(err) { // if we reject the promise we go here
		console.log("there was an error inserting the row");

		//other code

	})
}

/* queryARowExample()
**
** Shows how to use the query() method of DBRow. In order to perform a query, we can add query
** parameters using the addQuery() method. Once we are ready, we call query() and the row variable will
** contain the result of the query (undefined if the query failed to match anything or an array of rows
** if the query succeeds).
**
** NOTE: if you submit a really vague query (like I did here) in a production environment, you get get hundreds
** if not thousands of rows back, which will cause more strain on the system than if you make your query more
** specific in the first place! Do everyone a favor and be as specific as you can when querying.
*/
function queryARowExample() {
	var row = new DBRow(lit.tables.VOTE);
	row.addQuery(lit.fields.VOTE_VALUE, lit.ZERO); // let's look for votes with value 0 (display value -1)

	row.query().then(function() {
		if (!row.next()) // go to the next row (the first one)
			return console.log("If this returns false we got nothing back");

		console.log(row.getValue(lit.fields.ID));

		console.log(row.count()); // but id you're sneaky you'll notice we got more than one row back.. how do we see those too?
								  // see the usingNext()

		//other code

	}, function(err) {
		console.log("No rows match query or there was an error");

		//other code

	})
}

/* updateARow()
**
** Shows how to use the update() method of DBRow. This method will be useful when something is edited or a vote is changed.
** To update a row we first have to get the row we want to update. After we query that row, we can then make modifications
** to it using the setValue() method. Once we've changed what we want to change, we simply call update().
**
** NOTE: never update ids. Don't do it. Don't do it. Don't do it. Changing the id of a post causes a lot of problems because
** everything that refers to that post does so using its id (which could cause thousands of reference problems). Like I said,
** don't do it.
*/
function updateARow() {
	var row = new DBRow(lit.tables.VOTE);
	row.addQuery(lit.fields.VOTE_VALUE, lit.ZERO);

	row.query().then(function() {
		row.next();
		row.setValue(lit.fields.VOTE_VALUE, 1);
		console.log("do stuff");
		row.update().then(function(res) {
			console.log("Successfully updated the row");

			//other code

		}, function(err) {
			console.log("Failed to update the row for some reason!");

			//other code

		})

	}, function(err) {
		console.log("The query failed")

		// other code

	})
}

/* deleteARowExample()
**
** Shows how to use the delete() method of DBRow. This method would often be used in conjunction
** with the query() method because most of the time you won't know the id of the row to be deleted right off the bat.
** Once you have the row or the id of the row, you can then call delete to permanently destroy the row.
**
** NOTE: This example does not show the work that would need to be done to delete everything referring to the row
** deleted in this example. This would be especially important if a post, comment or user is deleted for some reason.
*/
function deleteARowExample() {
	var row = new DBRow(lit.tables.VOTE);
	row.addQuery(lit.fields.VOTE_VALUE, lit.ZERO);
	row.query().then(function() {
		if(!row.next())
			return console.log("There are no votes with value 0 left! You've defeated all the negativity on the Forum!")
		var idToDelete = row.getValue(lit.fields.ID);
		var rowToDelete = new DBRow(lit.tables.VOTE);
		rowToDelete.delete(idToDelete).then(function() {
			console.log("Successfully deleted the row");

			//other code

		}, function(err) {
			console.log("Failed to delete the row for some reason!");

			//other code
		})

	}, function(err) {
		console.log("there were no votes with value 0")

		//other code
	})
}

/* the curious case of next()
**
** to show off next() I'm giving you literally the simplest example of all time, but note
** that this function is extremely powerful and helpful when iterating through large numbers of rows
** and you need to make the same changes to all those rows (or delete them... but I hear we shouldn't
** do that).
*/
function usingNext() {
	var anotherRow = new DBRow(lit.tables.VOTE);
	anotherRow.addQuery(lit.fields.VOTE_VALUE, '1'); //let's look for votes with value 1 (display value +1)
	anotherRow.query().then(function() {
		console.log(anotherRow.count()); //
		while(anotherRow.next()) // next() returns true as long as there's another row
			console.log(anotherRow.getValue(lit.fields.ID));

		console.log("done");

		//other code

	}, function(err) {
		console.log("There was an error");
		//other code

	})
}

/* Using orderBy()
**
** This function shows how the orderBy() method can be used to order returned rows in a specific order.
** orderBy() can be used for a single field in each query, and can either sort by ascending ('ASC') or
** descending ('DESC') order. orderBy() is capable of sorting by both alphabetic and numerical orders.
*/
function usingOrderBy() {
	var anotherRow = new DBRow(lit.tables.VOTE);
	anotherRow.addQuery(lit.fields.VOTE_VALUE, lit.ONE); //let's look for votes with value 0 (display value -1)
	anotherRow.orderBy(lit.fields.ID, lit.sql.query.ASC);
	anotherRow.query().then(function() {
		while(anotherRow.next())
			console.log(anotherRow.getValue('id'));

		console.log("done");

		//other code

	}, function(result) {
		console.log("No rows match query or there was an error");
		//other code

	})
}

/* Using wildcards
**
** Possibly one of the coolest features of SQL (so happy I got it working) are wildcards.
** They work with the three argument addQuery() call as shown below. These can be used when
** users search for key words in posts and comments, or other things, but can be used to
** filter for extremely specific terms within larger blocks of text. These queries CANNOT be
** combined with other queries.
**
** For full documentation of all the things wildcards can do google SQL wildcards.
**
*/
function usingWildcardsToFindAPattern() {
	var row = new DBRow(lit.tables.POST);
	row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%pls help%");
	row.query().then(function() {
		row.next();
		console.log(row.getValue(lit.fields.TITLE));
		console.log(row.getValue(lit.fields.CONTENT));

	}, function(err) {
		console.log("There was an error")
	})
}

function alternateWildcardExample() { //TODO: Make this work if at all possible
	var row = new DBRow(lit.tables.COMMENT);
	row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%taken this class%");
	row.addQuery(lit.fields.AUTHOR, 'HotMuffin');
	row.query().then(function() {
		row.next();
		console.log(row.getValue(lit.fields.AUTHOR) + " wrote:")
		console.log(row.getValue(lit.fields.CONTENT));

	}, function(err) {
		console.log("There was an error")
	})
}

/* resetIndexExample
 *
 * Shows how to use the resetIndex function to allow you to cycle through a set of rows
 * more than once
 */
function resetIndexExample() {
	var row = new DBRow(lit.tables.COMMENT);
	row.addQuery(lit.fields.AUTHOR, "WizardPikachu");
	row.query().then(function() {
		while(row.next()) {
			console.log(row.getValue(lit.fields.ID));
		}
		row.resetIndex();
        while(row.next()) {
            console.log(row.getValue(lit.fields.ID));
        }
	})
}

/**
 * Same as the last one except it uses recursiveGetRowListWithVotes to get all of the
 */
function exampleUseOfARecursiveGet() {
    var row = new DBRow(lit.tables.COMMENT);
    var info = [[]];
    var userID = 'ufs6jhhbjavxymgt0m8a1x024pcj7khx';
    row.addQuery(lit.fields.AUTHOR, "CaptainUnicorn");
    row.query().then(function () {
        while (row.next()) {
            console.log(row.getValue(lit.fields.ID));
        }
        row.resetIndex();
        return new Promise(function (resolve, reject) {
            recursion.recursiveGetRowListWithVotes(resolve, reject, row, itemInfo.generalInfo, userID, info);
        });
    }).then(function () {
        console.log('no err!');
        console.log(info);
    }).catch(function (err, message) {
        console.log('err');
        console.log(err);
        console.log(message);
    });
}

/**
 * Tests using multiple wildcards in a single query. Note that the wildcards are all AND linked, so you cannot yet search
 * <if this OR that> only <if this AND that>
 */
function testMultpleWildcards() {
    var row = new DBRow(lit.tables.POST);
    row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%pls help%");
    row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%pls%");
    row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%I'm%");
    row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%no%");
    row.addQuery(lit.fields.TITLE, lit.sql.query.LIKE, "%indeterminate%");
    row.addQuery(lit.fields.TITLE, lit.sql.query.LIKE, "%analyze%");
    row.query().then(function () {
        row.next();
        console.log(row.getValue(lit.fields.TITLE));
        console.log(row.getValue(lit.fields.CONTENT));

    }, function (err) {
        console.log("There was an error")
    })
}

/**
 * An example of how to use OR queries to attempt to add queries for multiple values on the same field
 * In this (extremely trivial) example, we query for votes with vote values 1 or 0 (i.e. everything on the vote table)
 */
function orQueryExample() {
    var row = new DBRow(lit.tables.VOTE);
    row.addQuery(lit.fields.VOTE_VALUE, 1);
    row.addOrQuery(lit.fields.VOTE_VALUE, 0);
    row.query().then(function() {
        while(row.next())
            console.log(row.getValue(lit.fields.ID));

    }).catch(function() {
        console.log('An error occurred!');
    })
}

/**
 * A function to show off why OR Queries are so sweet... they make querying diverse things INFINITELY easier... here's
 * a simple example of using it to search for
 */
function slightlyMoreComplexOrQuery() {
    var row = new DBRow(lit.tables.COMMENT);
    // these are the beginning of two comments
    // in our mock dataset
    row.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%If you go on the terminal%");
    row.addOrQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%A phasor contains%"); // note different function name!

    row.query().then(function() { // now just like we normally do...
        while(row.next()) {
            console.log('This comment had ID: ' + row.getValue(lit.fields.ID));
            console.log(row.getValue(lit.fields.CONTENT));
            // note that we get back two matches even though both conditions are not met on both tables!!
		}
    }).catch(function() {
        console.log('An error occurred!');
    })
}