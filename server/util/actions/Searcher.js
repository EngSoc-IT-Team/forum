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

//TODO auto tag posts on insertion
//TODO get course numbers to search tags

var natural = require("natural");
var algorithmia = require("algorithmia");
var lit = require('./../Literals.js');
var log = require('./../log.js');
var dbr = require('./../DBRow.js');

var TfIdf = natural.TfIdf;
var wordRelater = new TfIdf();

/**
 * Searches a given table's given fields for data related to a given search. Does not allow searches with bad
 * search terms/tables/fields to be conducted.
 * @param inputSearch Search inputted by user.
 * @param table Array of tables to be searched.
 * @param fields Array of fields to be searched.
 */
function searchForContent(inputSearch, table, fields) {
    //check terms are legit, if they are continue with search
    if (goodInputs(inputSearch, table, fields)) {
        getKeyTerms(inputSearch).then(function (keyTerms) {
            return searchTable(keyTerms,table,fields);
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
 * @param fields The table fields attempted to be searched.
 * @returns {boolean} True if all inputs are legitimate, else false.
 */
function goodInputs(inputSearch, table, fields) {
    if (!(typeof inputSearch == lit.STRING) || inputSearch == undefined || inputSearch == "") {
        return false;
    } else {
        return goodTableInputs(table, fields);
    }
}

/**
 * Checks to make sure that the search terms for the table information (which table and fields) are legitimate.
 * Hardcoded which table/fields because it is a case by case basis, and should never be that large.
 * @param table The tables attempting to be searched.
 * @param fields The fields attempting to be searched.
 * @returns {boolean} True if the information is all searchable, else false.
 */
function goodTableInputs(table, fields) {
    if (!(typeof table == lit.STRING)) {
        return false;
    }
    //only allow tables that should be searched to be searched (and eliminate non tables)
    //and only search fields from that table that should be searched
    var goodFields = [];

    switch (table[i]) {
        case lit.CLASS_TABLE:
            goodFields.push(lit.FIELD_COURSE_CODE);
            goodFields.push(lit.FIELD_TITLE);
            goodFields.push(lit.FIELD_SUMMARY);
            goodFields.push(lit.FIELD_LONG_SUMMARY);
            return matchFields(goodFields, fields);
        case lit.POST_TABLE:
            goodFields.push(lit.FIELD_TITLE);
            goodFields.push(lit.FIELD_CONTENT);
            return matchFields(goodFields, fields);
        case lit.COMMENT_TABLE:
            goodFields.push(lit.FIELD_CONTENT);
            return matchFields(goodFields, fields);
        case lit.LINK_TABLE:
            goodFields.push(lit.FIELD_TITLE);
            goodFields.push(lit.FIELD_SUMMARY);
            return matchFields(goodFields, fields);
        case lit.TAG_TABLE:
            goodFields.push(lit.FIELD_SUMMARY);
            goodFields.push(lit.FIELD_RELATED_TAGS);
            goodFields.push(lit.FIELD_NAME);
            return matchFields(goodFields, fields);
        case lit.USER_TABLE:
            goodFields.push(lit.FIELD_USERNAME);
            return matchFields(goodFields, fields);
        default:
            return false;
    }
}

/**
 * Sanitizes fields to be searched so that it is a searchable field for a given table.
 * @param goodFields The searchable fields.
 * @param inputFields The fields attempted to being searched.
 * @returns {boolean} True if all of the attempted fields are searchable, else false.
 */
function matchFields(goodFields, inputFields) {
    for (var i in inputFields) {
        if (!(typeof inputFields[i] == lit.STRING) || !goodFields.includes(inputFields[i])) {
            log.log(inputFields[i]);
            return false;
        }
    }
    return true;
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
 * Function that takes data out of the database, finds its relation to the key terms of the search, eliminates lowly
 * related data and then then returns an array of the IDs of the data left, sorted by relation.
 * @param keyTerms Terms that data relation is found relative to.
 * @param table The table being searched.
 * @param fields The table fields being searched.
 * @returns {Promise} Promise as database query is asynchronous. Eventually returns an array of data IDs, sorted
 * by relation to keyTerms.
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
            documentInfo = removeLowMeasures(documentInfo);
            resolve(sortByMeasure(documentInfo));
        }).catch(function (error) {
            log.log("searchForPosts error: " + error);
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