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
        log.log("searchDatabase error: " + error);
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
    var documentIDs = [];
    var documentMeasures = [];
    var documentsRow = new dbr.DBRow(lit.POST_TABLE);
    return new Promise(function (resolve, reject) {
        documentsRow.query().then(function () {
            while (documentsRow.next()) {
                var doc = documentsRow.getValue(lit.FIELD_TITLE) + "\n" + documentsRow.getValue(lit.FIELD_CONTENT); //search the post content and title
                wordRelater.addDocument(doc);
                //add a row in the arrays for each document
                documentIDs.push(documentsRow.getValue(lit.FIELD_ID));
                documentMeasures.push(0);
            }
        }).then(function () {
            for (var termIndex in keyTerms) {
                wordRelater.tfidfs(keyTerms[termIndex], function (docIndex, measure) {
                    documentMeasures[docIndex] += measure;
                });
            }
            var trimmedDocInfo = removeLowRelations(documentMeasures, documentIDs);
            documentMeasures = trimmedDocInfo[0];
            documentIDs = trimmedDocInfo[1];
            resolve(sortDocumentsByRelation(documentMeasures,documentIDs));
        }).catch(function (error) {
            reject(error);
        });
    });
}

function sortDocumentsByRelation(documentMeasures, documentIDs) {
    var sortedPosts = [];
    var biggestMeasure = 0;
    var biggestIndex = -1;
    while (documentMeasures.length > 0) {
        for (var i in documentMeasures) {
            if (documentMeasures[i] > biggestMeasure) {
                biggestMeasure = documentMeasures[i];
                biggestIndex = i;
            }
        }
        sortedPosts.push(documentIDs[i]);
        documentMeasures.splice(i, 1);
        documentIDs.splice(i, 1);
    }
    return sortedPosts;
}

function removeLowRelations(documentMeasures, documentIDs) {
    var i = 0;
    while (i < documentMeasures.length) {
        if (documentMeasures[i] < lit.MIN_RELATION_MEASURE) { //remove the posts that aren't related enough
            documentMeasures.splice(i, 1);
            documentIDs.splice(i, 1);
            //counter auto continued because the array decreased one size
        } else {
            i++;
        }
    }
    var retArr = [];
    retArr[0] = documentMeasures;
    retArr[1] = documentIDs;
    return retArr;
}