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
    location.href = '/list?advanced=true&'; //add params here, it will reload the page
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