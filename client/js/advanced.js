/**
 * Advanced.js
 * Written by Michael Albinson 06/08/17
 */

"use strict";

var select2Options = {data: [], tags: true, tokenSeparators: [',', ' '], width: 'resolve',
    theme: "classic",  maximumSelectionLength: 3, forcebelow: true};

function sendQuery() {
    //get params as /list?advanced=true&table=<TABLE>&tags=<TAGS>&keywords=<KEYWORDS COMMA SEPARATED NO SPACES>&exactPhrase=<EXACT PHRASE>&titleContains=<TITLE WORDS COMMA SEPARATED>
    // if a text field is empty DO NOT INCLUDE IT in the query

    var tags = $('#tags')[0].value;
    var keywords = $('#keywords')[0].value;
    var exactPhrase = $('#exact-words')[0].value;
    var title = $('#title')[0].value;

    var queryString  = '/list?advanced=true&table='+currentButton.replace('#','');

    // this is all good FOR THE POST TABLE ONLY -- need more logic for other tables and will probably want to modify the
    // associated advanced page .pug file
    if (tags.length > 0)
        queryString += '&tags=' + getCommaDelimitedString(tags);

    if (keywords.length > 0)
        queryString += '&keywords=' + getCommaDelimitedString(keywords);

    if (exactPhrase.length > 0)
        queryString += '&exactPhrase=' + exactPhrase;

    if (title.length > 0)
        queryString += '&titleContains=' + getCommaDelimitedString(title);

    location.href = queryString;
}

function getCommaDelimitedString(s) {
    return s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").replace(/[\s,]+/g, ',')
}

var currentButton = 'all'; // hint, this is the table name
var firstClick = true;
function toggleSelection(button) {
    $('#toggle').addClass('hidden');
    $(currentButton).removeClass('active');
    currentButton = "#" + button;
    $(currentButton).addClass('active');

    if (firstClick) {
        $('#filter').fadeIn();
        firstClick = false;
    }

}