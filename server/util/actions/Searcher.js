/**
 * Created by Carson on 24/02/2017.
 * Implementation for searching. Users enter their search terms in a search bar, and the key parts
 * are used to look through the database of posts/comments. Implements AutoTag algorithm from Algorithmia to
 * automatically get the key parts of the search terms. Note that numbers (e.g. course numbers) are not considered
 * to be words, and will need to be parsed out manually and searched for in the tags column.
 * Those words are then checked to see how relevant they are to posts/comments in the database. This is done by Natural.
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

//TODO stop holding entire database in memory when searching - wildcards
//TODO allow no table to be specified

var natural = require("natural");
var algorithmia = require("algorithmia");
var lit = require('./../Literals.js');
var log = require('./../log.js');
var dbr = require('./../DBRow.js');
var recursion = require('../recursion');

var TfIdf = natural.TfIdf;
var wordRelater = new TfIdf;

var searchableTables = [lit.CLASS_TABLE, lit.LINK_TABLE, lit.POST_TABLE, lit.COMMENT_TABLE, lit.TAG_TABLE];

/**
 * Function argument used for recursively getting the generated tags of a searchable row. Adds tags to the wordRelater.
 * @param table The table the row is from.
 * @param tags The tags to be added to the wordRelater
 * @param row The row used to get the tag.
 * @returns {{measure: number, id}} Object to be added to documentInfo array - makes a spot for each
 */
var addDocument = function (tags, row, table) {
    wordRelater.addDocument(tags);
    return {measure: 0, id: row.getValue(lit.FIELD_ID), table: table};
};

var queryOneTable = function (table) {
    var row = new dbr.DBRow(table);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            recursion.recursiveGetTags(resolve, reject, row, addDocument, table, []);
        }).catch(function (err) {
            log.error("queryTable error: " + err);
            reject(err);
        });
    });
};

/**
 * Searches a given array of table for data related to a given search. Fields are chosen for you, as the fields
 * that should be searched. Does not allow searches with bad search terms/tables to be conducted.
 * @param inputSearch Search inputted by user.
 * @param table Array of tables to be searched.
 */
exports.searchForContent = function (inputSearch, table) {
    return new Promise(function (resolve, reject) {
        if (goodInputs(inputSearch, table)) {
            getKeyTerms(inputSearch).then(function (keyTerms) {
                return searchGenTags(keyTerms, table);
            }).then(function (documentInfo) {
                documentInfo = removeLowMeasures(documentInfo);
                var sortedPosts = mergeSort(documentInfo);
                searchByUserTag(inputSearch).then(function (userPosts) {
                    for (var i in userPosts) {
                        if (!sortedPosts.includes(userPosts[i])) { //no duplicated posts
                            //just add posts with the tags to the end - actual content of post more important than tags
                            sortedPosts.push(userPosts[i]);
                        }
                    }
                    //get ids and tables in one array to be used to send back to listHandler
                    var res = [];
                    res[0] = [];
                    res[1] = [];
                    for (var j in sortedPosts) {
                        res[0].push(sortedPosts[j][lit.FIELD_ID]);
                        res[1].push(sortedPosts[j][lit.TABLE]);
                    }
                    resolve(res);
                })
            }).catch(function (error) {
                log.error("searchForContent error: " + error);
            });
        } else {
            reject("your input terms didn't work for a search!");
        }
    });
};

//TODO put generateTags newHandler.js and then use item table to search for user and generated tags
/**
 * Function that generates and inserts tags for content for later search usage.
 * @param newRow The row to generate tags for and to insert the tags into.
 * @param table The row's table for which the new tags are being generated.
 * @returns {Promise} Promise as querying database is asynchronous. Eventually returns the generated tags,
 * which is one String with each tag concatenated by a space.
 */
exports.generateTags = function (newRow, table) {
    return new Promise(function (resolve, reject) {
            if (goodInputs("this is a good search", table)) { //dummy input search so goodInputs() can be re-used for the table arg

                //get the fields and add all fields together to get content to search for
                var fields = getSearchableFields(table);
                var content = " ";
                for (var index in fields) {
                    content += newRow.getValue(fields[index]) + "\n";
                }

                getKeyTerms(content).then(function (keyTerms) {
                    var tags = "";
                    for (var i in keyTerms) {
                        tags += keyTerms[i];
                        if (i < keyTerms.length - 1) {
                            tags += " "; //space splits up tags
                        }
                    }
                    newRow.setValue(lit.FIELD_GEN_TAGS, tags);
                    newRow.update().then(function () {
                        resolve(tags); //string of all tags to be put into field for the new post
                    });
                }).catch(function (error) {
                    log.error("tagPosts error: " + error);
                    reject(error);
                });
            } else {
                reject("Tried to generate tags for a bad table");
            }
        }
    );
};

/**
 * Function to search for posts by tags. Goes through search term looking for tags in database and numbers, then
 * finds posts with those tags/tags with that number.
 * @param inputSearch The search term.
 * @returns {Promise} Promise as query to database is asynchronous. Eventually returns an array of post IDs that have
 * matching tags/numbers.
 */
function searchByUserTag(inputSearch) {
    return new Promise(function (resolve, reject) {
        if (!(typeof inputSearch === lit.STRING)) {
            reject("you inputted an invalid search!");
        }
        getUserTagsInDB().then(function (dbTags) {
            var words = inputSearch.toUpperCase().split(/[ ,!?.]+/); //all possibilities for things splitting up words
            //and tags are all in upper case, so searched tags need to be as well

            return words.filter(function (element) {//take out words from the input search that don't include a tag in them
                //if the word is a tag if it is the same as a dbTag or if it has a number
                //often people refer to courses just by the number (e.g. you won't pass 112!)
                return dbTags.includes(element) || element.includes("1") || element.includes("2") || element.includes("3")
                    || element.includes("4") || element.includes("5") || element.includes("6") || element.includes("7")
                    || element.includes("8") || element.includes("9") || element.includes("0");
            });
        }).then(function (tagsInSearch) {
            //find posts with tags either matching a tag or that has the same course number that was searched
            var row = new dbr.DBRow(lit.POST_TABLE);
            var postsWithTags = [];
            row.query().then(function () {
                while (row.next()) {
                    for (var index in tagsInSearch) {
                        if (row.getValue(lit.FIELD_TAGS).includes(tagsInSearch[index])) {
                            postsWithTags.push({measure: 0, id: row.getValue(lit.FIELD_ID), table: lit.POST_TABLE});
                        }
                    }
                }
                resolve(postsWithTags);
            }).catch(function (err) {
                log.error("searchByTag - getting posts - error: " + err);
                reject(err);
            });
        }).catch(function (err) {
            log.error("searchByTag: " + err);
        });
    });
}

/**
 * Retrieves all tags currently in the database
 * @returns {Promise} Promise as database query is asynchronous. Eventually returns an array of Strings, one
 * for each tag in the database.
 */
function getUserTagsInDB() {
    var tags = [];
    return new Promise(function (resolve, reject) {
        var row = new dbr.DBRow(lit.TAG_TABLE);
        row.query().then(function () {
            while (row.next()) {
                tags.push(row.getValue(lit.FIELD_NAME));
            }
            resolve(tags);
        }).catch(function (err) {
            log.error("getTagsInDB error: " + err);
            reject(err);
        });
    });
}

/**
 * Sanitizes search input.
 * @param inputSearch The search term attempted.
 * @param table The table attempted to be searched.
 * @returns {boolean} True if all inputs are legitimate, else false.
 */
function goodInputs(inputSearch, table) {
    if (!(typeof inputSearch === lit.STRING) || inputSearch === undefined || inputSearch === "") {
        return false;
    } else {
        if (table === undefined || table === null) { //means we search all searchable tables
            return true;
        }
        //check that table is actually a table name
        return !(!(typeof table === lit.STRING) || (table !== lit.CLASS_TABLE && table !== lit.POST_TABLE && table !== lit.COMMENT_TABLE &&
        table !== lit.LINK_TABLE && table !== lit.TAG_TABLE && table !== lit.USER_TABLE));
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
 * @returns {Promise} Promise as database query is asynchronous. Eventually returns an array of objects holding
 * content IDs and their relation to the key terms.
 */
function searchGenTags(keyTerms, table) {
    wordRelater = new TfIdf;
    return new Promise(function (resolve, reject) {
        //TODO wildcard to filter posts
        queryTables(table).then(function (documentInfo) {
            for (var termIndex in keyTerms) {
                wordRelater.tfidfs(keyTerms[termIndex], function (docIndex, measure) {
                    documentInfo[docIndex][lit.KEY_MEASURE] += measure;
                });
            }
            resolve(documentInfo);
        }).catch(function (error) {
            log.error("searchGenTags error: " + error);
            reject(error);
        });
    });
}

function queryTables(table) {
    return new Promise(function (resolve, reject) {
        if (table === undefined || table === null) { //search all tables
            recursion.recursiveGetTagsMultiTables(resolve, reject, searchableTables, 0, [], queryOneTable);
        } else {
            queryOneTable(table).then(function (docInfo) {
                resolve(docInfo);
            }).catch(function (err) {
                log.error("queryTables error: " + err);
                reject(err);
            });
        }
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