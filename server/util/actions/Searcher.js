/**
 * Created by Carson on 24/02/2017.
 * Implementation for the search function. Users enter their search terms in the search bar, and the key parts
 * are used to look through the database of posts/comments. Implements AutoTag algorithm from Algorithmia to
 * automatically get the key parts of the search terms. Note that numbers (e.g. course numbers) are not considered
 * to be words, and will need to be parsed out manually and searched for in the tags column.
 * Those words are then checked to see how relevant they
 * are to posts/comments in the database. This is done by Natural.
 *
 * need: npm install natural, npm install algorithmia
 *
 * AutoTag algorithm: https://algorithmia.com/algorithms/nlp/AutoTag
 * Natural Github: https://github.com/NaturalNode/natural
 *
 * Note: it is possible a small cost would be needed to use the AutoTag algorithm. Algorithmia credits are used to cover
 * the cost of the algorithm, which is estimated to be 11K credits per 10,000 calls. This would amount to ~1.17 USD per
 * 10,000 calls. However, for free, 5K credits are given each month, so on a small scale it is still free.
 */

var natural = require("natural");
var algorithmia = require("algorithmia");
var lit = require('./../Literals.js');
var log = require('./../log.js');
var dbr = require('./../DBRow.js');

var TfIdf = natural.TfIdf;
var wordRelater = new TfIdf();

//main function that ties it all together
function searchForContent(inputSearch) {
    getKeyTerms(inputSearch).then(function (keyTerms) {
        return searchForPosts(keyTerms);
    }).catch(function (error) {
        log.log("searchForContent error: " + error);
    });
}

//get the key parts of the search
function getKeyTerms(inputSearch) {
    return new Promise(function (resolve, reject) {
        algorithmia.client(lit.AUTO_TAG_API_KEY).algo(lit.AUTO_TAG_ALGORITHM).pipe(inputSearch)
            .then(function (response) {
                resolve(response.get());
            }, function (err) {
                reject(err);
            });
    });
}

//get the course numbers manually

//search through a post and get list of related ones, sorted as it's built
function searchForPosts(keyTerms) {
    var documentInfo = [];
    var row = new dbr.DBRow(lit.POST_TABLE);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                //search the post content and title
                var doc = row.getValue(lit.FIELD_TITLE) + "\n" + row.getValue(lit.FIELD_CONTENT);
                wordRelater.addDocument(doc);
                var docID = row.getValue(lit.FIELD_ID);
                var oneDoc = {measure: 0, id: docID};
                //add a row in the arrays for each document
                documentInfo.push(oneDoc);
            }
        }).then(function () {
            for (var termIndex in keyTerms) {
                wordRelater.tfidfs(keyTerms[termIndex], function (docIndex, measure) {
                    documentInfo[docIndex][lit.KEY_MEASURE] += measure;
                });
            }
            documentInfo = removeLowRelations(documentInfo);
            resolve(sortByMeasure(documentInfo));
        }).catch(function (error) {
            log.log("searchForPosts error: " + error);
            reject(error);
        });
    });
}

function removeLowRelations(documentInfo) {
    var i = 0;
    while (i < documentInfo.length) {
        if (documentInfo[i][lit.KEY_MEASURE] < lit.MIN_RELATION_MEASURE) { //remove the posts that aren't related enough
            documentInfo.splice(i, 1);
            //counter auto continued because the array decreased one size
        } else {
            i++;
        }
    }
    return documentInfo;
}

function sortByMeasure(documentInfo) {
    documentInfo = mergeSort(documentInfo);
    var sortedIDs = [];
    for (var index in documentInfo) {
        sortedIDs.push(documentInfo[index][lit.FIELD_ID]);
    }
    log.log(sortedIDs);
    return sortedIDs;
}

function mergeSort(arr) {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);

    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    var result = [];

    while (left.length && right.length) {
        if (left[0][lit.KEY_MEASURE] <= right[0][lit.KEY_MEASURE]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}