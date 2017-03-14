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

//TODO get course numbers to search tags

var natural = require("natural");
var algorithmia = require("algorithmia");
var lit = require('./../Literals.js');
var log = require('./../log.js');
var dbr = require('./../DBRow.js');

var TfIdf = natural.TfIdf;
var wordRelater = new TfIdf();

//TODO talk with michael about how to do this
//can an object be passed in here? object with each newPost field in it
//for tags, just throwing in a string of them separated by commas?
function tagPosts(newPostContent) {
    return new Promise(function (resolve, reject) {
            getKeyTerms(newPostContent).then(function (keyTerms) {
                var tags = "";
                for (var i in keyTerms) {
                    tags += keyTerms[i];
                    if (i < keyTerms.length - 1) {
                        tags += ", ";
                    }
                }
                resolve(tags); //string of all tags to be put into field for the new post
            }).catch(function (error) {
                log.log("tagPosts error: " + error);
                reject(error);
            });
        }
    );
}

/**
 * Searches a given array of table for data related to a given search. Fields are chosen for you, as the fields
 * that should be searched. Does not allow searches with bad search terms/tables to be conducted.
 * @param inputSearch Search inputted by user.
 * @param table Array of tables to be searched.
 * @param fields Array of fields to be searched.
 */
searchForContent("install a module", lit.POST_TABLE);
//check terms are legit, if they are continue with search
function searchForContent(inputSearch, table) {
    if (goodInputs(inputSearch, table)) {
        getKeyTerms(inputSearch).then(function (keyTerms) {
            var fields = getSearchableFields(table);
            return searchTable(keyTerms, table, fields)
        }).then(function (documentInfo) {
            documentInfo = removeLowMeasures(documentInfo);
            return sortByMeasure(documentInfo);
        }).catch(function (error) {
            log.log("searchForContent error: " + error);
        });
    } else {
        log.log("your input terms didn't work for a search!");
    }
}

/**
 * Sanitizes search input.
 * @param inputSearch The search term attempted.
 * @param table The table attempted to be searched.
 * @returns {boolean} True if all inputs are legitimate, else false.
 */
function goodInputs(inputSearch, table) {
    if (!(typeof inputSearch == lit.STRING) || inputSearch == undefined || inputSearch == "") {
        return false;
    } else {
        //check that table is actually a table name
        return !(!(typeof table == lit.STRING) || (table != lit.CLASS_TABLE && table != lit.POST_TABLE && table != lit.COMMENT_TABLE &&
        table != lit.LINK_TABLE && table != lit.TAG_TABLE && table != lit.USER_TABLE));
    }
}

/**
 * Returns an array of fields to be searched for each table. Hardcoded because there's not that many fields to
 * search and not that many tables that are searched.
 * @param table The table being searched.
 * @returns {Array} Array of the fields to be searched.
 */
function getSearchableFields(table) {
    var searchableFields = [];
    switch (table) {
        case lit.CLASS_TABLE:
            searchableFields.push(lit.FIELD_COURSE_CODE);
            searchableFields.push(lit.FIELD_TITLE);
            searchableFields.push(lit.FIELD_SUMMARY);
            searchableFields.push(lit.FIELD_LONG_SUMMARY);
            break;
        case lit.POST_TABLE:
            searchableFields.push(lit.FIELD_TITLE);
            searchableFields.push(lit.FIELD_CONTENT);
            break;
        case lit.COMMENT_TABLE:
            searchableFields.push(lit.FIELD_CONTENT);
            break;
        case lit.LINK_TABLE:
            searchableFields.push(lit.FIELD_TITLE);
            searchableFields.push(lit.FIELD_SUMMARY);
            break;
        case lit.TAG_TABLE:
            searchableFields.push(lit.FIELD_SUMMARY);
            searchableFields.push(lit.FIELD_RELATED_TAGS);
            searchableFields.push(lit.FIELD_NAME);
            break;
        case lit.USER_TABLE:
            searchableFields.push(lit.FIELD_USERNAME);
            break;
    }
    return searchableFields;
}

/**
 * Gets the key terms from an input String using Algoithmia Auto Tag API.
 * @param input String to get key terms from.
 * @returns {Promise} Promise as API is asynchronous. Eventually gets a String array of the key terms.
 */
function getKeyTerms(input) {
    return new Promise(function (resolve, reject) {
        algorithmia.client(lit.AUTO_TAG_API_KEY).algo(lit.AUTO_TAG_ALGORITHM).pipe(input)
            .then(function (response) {
                resolve(response.get());
            }, function (err) {
                reject(err);
            });
    });
}

/**
 * Function that takes data out of the database and finds its relation to the key terms of the search.
 * @param keyTerms Terms that data relation is found relative to.
 * @param table The table being searched.
 * @param fields The table fields being searched.
 * @returns {Promise} Promise as database query is asynchronous. Eventually returns an array of objects holding
 * content IDs and their relation to the key terms.
 */
function searchTable(keyTerms, table, fields) {
    var documentInfo = [];
    var row = new dbr.DBRow(table);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                //search the post content and title
                var docData = "";
                for (var i in fields) {
                    docData += row.getValue(fields[i]) + "\n";
                }
                wordRelater.addDocument(docData);
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
            resolve(documentInfo);
        }).catch(function (error) {
            log.log("searchTable error: " + error);
            reject(error);
        });
    });
}

/**
 * Removes documents from search consideration that have too low of a measure.
 * @param documentInfo Documents being considered.
 * @returns {*} Array with low measures moved.
 */
function removeLowMeasures(documentInfo) {
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

/**
 * Sorts document info by measure, and then returns an array of the document IDs in the same order.
 * @param documentInfo document array to sort by measure.
 * @returns {Array} Sorted document IDs.
 */
function sortByMeasure(documentInfo) {
    documentInfo = mergeSort(documentInfo);
    var sortedIDs = [];
    for (var index in documentInfo) {
        sortedIDs.push(documentInfo[index][lit.FIELD_ID]);
    }
    log.log(sortedIDs);
    return sortedIDs;
}

/**
 * Partitions the array being sorted by the Merge Sort algorithm.
 * @param arr Array to be sorted.
 * @returns {*} Sorted Array.
 */
function mergeSort(arr) {
    if (arr.length < 2)
        return arr;
    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);
    return merge(mergeSort(left), mergeSort(right));
}

/**
 * Merges partial arrays made by Merge Sort algorithm.
 * @param left Left array.
 * @param right Right array.
 * @returns {Array} Merged array. Eventually the fully sorted array.
 */
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