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

var input = "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly" +
    " from one party to another without going through a financial institution. Digital signatures provide part of " +
    "the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. " +
    "We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps " +
    "transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that " +
    "cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the " +
    "sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority " +
    "of CPU power is controlled by nodes that are not cooperating to attack the network, they'll generate the longest " +
    "chain and outpace attackers. The network itself requires minimal structure. Messages are broadcast on a best effort" +
    " basis, and nodes can leave and rejoin the network at will, accepting the longest proof-of-work chain as proof " +
    "of what happened while they were gone.";

var natural = require("natural");
var algorithmia = require("algorithmia");
var lit = require('./Literals.js');
var log = require('./log.js');
var dbr = require('./DBRow.js');

var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();

//main function that ties it all together
function searchForContent(inputSearch) {
    getKeyTerms(inputSearch).then(function (keyTerms) {
        return searchForPosts(keyTerms);
    })
        .catch(function (error) {
            log.log("searchDatabase error: " + error);
        });
}

//get the key parts of the search
function getKeyTerms(inputSearch) {
    return new Promise(function (resolve, reject) {
        algorithmia.client(lit.AUTO_TAG_API_KEY).algo(lit.AUTO_TAG_ALGORITHM).pipe(input)
            .then(function (response) {
                resolve(response.get());
            }, function (err) {
                reject(err);
            });
    });
}

//get the course numbers manually

//search through a post and get list of related ones, sorted as it's built
var arr = ["install"];
searchForPosts(arr);
function searchForPosts(keyTerms) {
    var sortedPosts = [];
    var documentIndices = [];
    var documentIDs = [];
    var documentMeasures=[];
    var terms = "";
    for (var index in keyTerms) {
        terms += keyTerms[index];
    }
    //add all post title and content to the tfidf as separate documents
    var documentsRow = new dbr.DBRow(lit.POST_TABLE);
    documentsRow.query().then(function () {
        while (documentsRow.next()) {
            var doc = documentsRow.getValue(lit.FIELD_TITLE) + "\n" + documentsRow.getValue(lit.FIELD_CONTENT);
            documentIDs.push(documentsRow.getValue(lit.FIELD_ID));
            tfidf.addDocument(doc);
        }
    }).then(function () {
        tfidf.tfidfs(terms, function (i, measure) {
            //sort array as it's built
            if (documentMeasures.length == 0 || measure <= documentMeasures[documentIndices.length - 1]) {
                documentMeasures.push(measure);
                documentIndices.push(i);
            } else {
                documentMeasures.unshift(measure);
                documentIndices.unshift(i);
            }
        });
        for (var index in documentIndices){
            sortedPosts[index]=documentIDs[documentIndices[index]];
        }
    });

}