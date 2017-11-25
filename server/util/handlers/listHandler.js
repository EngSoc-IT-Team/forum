/*
 * listHandler.js
 * Written by Michael Albinson 2/15/17
 *
 * Logic for handling requests from the list page.
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var log = require('./../log');
var searcher = require('./../actions/Searcher');
var recursion = require('./../recursion');
var itemInfo = require('./itemInfoGetter');

//TODO: add hidden handling -- or just avoid them

/** Handles requests from the list page and resolves a list of matching items for the query, or uses the Searcher functionality
 * to use more advanced query parsing. Resolves an array of JSON objects containing
 *
 * @param request: the express request from the client
 */
exports.handle = function (request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    return new Promise(function (resolve, reject) {
        var items = new DBRow(lit.tables.ITEM);

        if (request.query.hasOwnProperty('query'))
            return useSearch(resolve, reject, request);

        if (request.query.hasOwnProperty('advanced') && request.query.advanced === "true")
            return executeAdvanced(resolve, reject, request);

        for (var key in request.query)
            items.addQuery(key, lit.sql.query.LIKE, '%' + request.query[key] + '%'); //TODO: Fix tag handling (should be able to get post by tag for any item)

        items.orderBy(lit.fields.TIMESTAMP, lit.sql.query.DESC);
        items.setLimit(20);
        items.query().then(function () {
            recursion.recursiveGetWithVotes(resolve, reject, items, itemInfo.generalInfo, userID, [info]);
        }).catch(function () {
            reject(false);
        });
    });
};

/** Uses the Searcher's searchForContent function parse a search query string to build the list page's information array.
 *
 * @param resolve: The handle function's resolution
 * @param reject: The handle function's rejection
 * @param request: The express server's request
 */
function useSearch(resolve, reject, request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    searcher.searchForContent(request.query.query).then(function (res) {
        recursion.recursiveGetListWithVotes(resolve, reject, res[0], res[1], itemInfo.generalInfo, userID, [info], 0);
    }).catch(function (err) {
        reject(err);
    });
}



//.like wildcards for specific searches
//while loop to check if there is something in the next row
//check to see if there is a match in each row.

function addTagstoQuery(rowObj, tags){
    if(tags === undefined)
        return;
    var keywordArr = tags.split(',');
    for(var index in keywordArr)
        rowObj.addQuery (lit.fields.TAGS, lit.sql.query.LIKE, "%"+keywordArr[index]+"%")
}

function addExactWordstoQuery(rowObj2, exactW) {
    if(exactW === undefined)
        return;
    var keywordArr2 = exactW.split(',');
    for(var index in keywordArr2)
        rowObj2.addQuery (lit.fields.CONTENT, lit.sql.query.LIKE, "%"+keywordArr2[index]+"%");

}

function addKeywordstoQuery(rowObj3, exactK) {
    if(exactK === undefined)
        return;
    var keywordArr3 = exactK.split(',');
    for(var index in keywordArr3)
        rowObj3.addQuery (lit.fields.CONTENT, keywordArr3[index]);

}

function executeAdvanced(resolve, reject, request) {
    // does search
    var info = [[]];
    var userID = request.signedCookies.usercookie.userID;

    var title = request.query.titleContains;
    var table = request.query.table;
    var tags = request.query.tags;
    var keywords = request.query.keywords;
    var exactWords = request.query.exactPhrase;


    if(table === "posts") {

        var posty = new DBRow(lit.tables.POST);

        if(title !== "NULL")
            posty.addQuery(lit.fields.TITLE, title);
        //if(keywords !== "NULL")
            //posty.addQuery(lit.fields.CONTENT, keywords);
        addKeywordstoQuery(posty, keywords);
        //if(exactWords !== "NULL")
          //  posty.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%"+exactWords+"%");
        addExactWordstoQuery(posty, exactWords);
        //if(tags !== "NULL")
            //posty.addQuery(lit.fields.TAGS, lit.sql.query.LIKE, "%"+tags+"%");
        addTagstoQuery(posty, tags);

        posty.query().then(function(resolve, reject) {
            //while(posty.next()) {
              //  console.log(posty.getValue(lit.fields.TITLE));
            //}
           //posty.resetIndex();
            //return new Promise(function (resolve, reject){
                recursion.recursiveGetRowListWithVotes(resolve, reject, posty, itemInfo.generalInfo, userID, info)
            //});
            //if (!posty.next())
                //return console.log("nothing");
           /* }).then(function () {
            console.log("no error");
            console.log(info);*/
        }).catch(function(err, message){
            console.log('err receiving rows');
            console.log(err);
            console.log(message);
        });

    }

    if(table === "link"){

        var linker = new DBRow(lit.tables.post);

        linker.query().then(function() {
            if(!linker.next()){
                return console.log("nothing");
            }
            while(linker.next()){
                linker.addQuery(lit.fields.TITLE, title);
                linker.addQuery(lit.fields.CONTENT, keywords);
                linker.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%"+ exactWords +"%");
                linker.addQuery(lit.fields.TAGS, lit.sql.query.LIKE, "%"+ tags +"%");
            }
        }, function(err) {
            console.log("No rows match, error");
            reject(false);
        });

    }

    if(table === "classes"){

        var classer = new DBRow(lit.tables.post);

        classer.query().then(function() {
            if(!classer.next()){
                return console.log("nothing");
            }
            while(classer.next()){
                classer.addQuery(lit.fields.TITLE, title);
                classer.addQuery(lit.fields.CONTENT, keywords);
                classer.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%"+ exactWords +"%");
                classer.addQuery(lit.fields.TAGS, lit.sql.query.LIKE, "%"+ tags +"%");
            }
        }, function(err) {
            console.log("No rows match, error");
            reject(false);
        });


    }

    if(table === "user"){

        var userer = new DBRow(lit.tables.post);

        userer.query().then(function() {
            if(!userer.next()){
                return console.log("nothing");
            }
            while(userer.next){
                userer.addQuery(lit.fields.TITLE, title);
                userer.addQuery(lit.fields.CONTENT, keywords);
                userer.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%"+ exactWords +"%");
                userer.addQuery(lit.fields.TAGS, lit.sql.query.LIKE, "%"+ tags +"%");
            }
        }, function(err) {
            console.log("No rows match, error");
            reject(false);
        });

    }
    /*var row = new DBRow(lit.VOTE_TABLE);
    row.addQuery(lit.FIELD_USER_ID, lit.LIKE, "%"+ "a" +"%");
    row.addQuery(lit.FIELD_USER_ID, "a");


    row.query().then(function() {
        if (!row.next())
            return console.log("nothing back!");

        console.log(row.getValue(lit.FIELD_ID));
        console.log(row.count());
    }, function(err) {
        console.log("No rows match, error");
    });
    */
}