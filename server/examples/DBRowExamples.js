var dbr = require('../util/DBRow');
var generator = require('../util/IDGenerator');


/* A series of basic functions to get you're head around using the DBRow object
** each should be fairly self explainitory, but for future folks
**
** TODO: add detailed descriptions for each function
*/

function getARowExample() {
	var row = new dbr.DBRow('user');
	row.getRow('1234567890abcdefghijklmnopqrstuv').then(function(result) {
		console.log(row.getValue('netid'));
		console.log(row.getValue('username'));
		// other code

	}, function(result) {
		console.log("error getting the row")
		//other code

	})
}

function insertARowExample(){
	var newRow = new dbr.DBRow('vote');
	var userID = generator.generate();
	var voteID = generator.generate();
	newRow.setValue('voteValue', '0'); // insert vote with vote value +1
	newRow.setValue('commentOrPostID', generator.generate());
	newRow.setValue('userID', userID);
	newRow.setValue('id', voteID);

	newRow.insert().then(function(result) {
		console.log(result); // will return true as long as we submit a valid query
		//other code
	}, function(result) {
		console.log("there was an error inserting the row")
		//other code 
	})
}

function queryARowExample() {
	var anotherRow = new dbr.DBRow('vote');
	anotherRow.addQuery('voteValue', '0'); //let's look for votes with value 0 (display value -1)
	anotherRow.query().then(function(result) {
		anotherRow.next(); // go to the next row (the first one)
		console.log(anotherRow.getValue('id')); 
		//other code
		
	}, function(result) {
		console.log("No rows match query or there was an error");
		//other code

	})
}


function updateARow() {
	var row = new dbr.DBRow('vote');
	row.addQuery('voteValue', '0');
	row.query().then(function(result){
		row.next();
		var idToUpdate = row.getValue('id');
		var rowToUpdate = new dbr.DBRow('vote');
		rowToUpdate.setValue('id', idToUpdate);
		rowToUpdate.setValue('voteValue', 1);
		rowToUpdate.update().then(function(res) {
			console.log("Successfully updated the row");
			//other code

		}, function(res) {
			console.log("Failed to update the row for some reason!");
			//other code
		})

	}, function(result) {
		console.log("there were no votes with value 0")
		// other code

	})
}

function alternateUpdateRow() {
	var row = new dbr.DBRow('vote');
	row.addQuery('voteValue', '0');
	row.query().then(function(result){
		row.next();
		row.setValue('voteValue', 1);
		row.update().then(function(res) {
			console.log("Successfully updated the row");
			//other code

		}, function(res) {
			console.log("Failed to update the row for some reason!");
			//other code
		})

	}, function(result) {
		console.log("there were no votes with value 0")
		// other code

	})
}

function deleteARowExample() {
	var row = new dbr.DBRow('vote');
	row.addQuery('voteValue', '0');
	row.query().then(function(result){
		row.next();
		var idToDelete = row.getValue('id');
		var rowToDelete = new dbr.DBRow('vote');
		rowToDelete.delete(idToDelete).then(function(res) {
			console.log("Successfully deleted the row");
			//other code

		}, function(res) {
			console.log("Failed to delete the row for some reason!");
			//other code
		})

	}, function(result) {
		console.log("there were no votes with value 0")
		//other code
	})
}

/* the curious case of next */
// to show off next() I'm giving you literally the simplest example of all time, but note
// that this function is extremely powerful and helpful when iterating through large numbers of rows
function usingNext() {
	var anotherRow = new dbr.DBRow('vote');
	anotherRow.addQuery('voteValue', '0'); //let's look for votes with value 0 (display value -1)
	anotherRow.query().then(function(result) {
		console.log(anotherRow.count());
		while(anotherRow.next())
			console.log(anotherRow.getValue('id')); 

		console.log("done");

		//other code
		
	}, function(result) {
		console.log("No rows match query or there was an error");
		//other code

	})
}


function usingOrderBy() {
	var anotherRow = new dbr.DBRow('vote');
	anotherRow.addQuery('voteValue', '0'); //let's look for votes with value 0 (display value -1)
	anotherRow.orderBy('id', 'DESC');
	anotherRow.query().then(function(result) {
		console.log(anotherRow.count());
		while(anotherRow.next())
			console.log(anotherRow.getValue('id')); 

		console.log("done");

		//other code
		
	}, function(result) {
		console.log("No rows match query or there was an error");
		//other code

	})
}
