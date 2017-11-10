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

    //Use jQuery to get the innerText of all the fields
    //function getLoginContent() {

        var tags = $('#tags')[0].value;
        var keywords = $('#keywords')[0].value;
        var exactWords = $('#exact-words')[0].value;
        var title = $('#title')[0].value;
    //}
    //Initialize the queryString variable with the selected table to search
    var queryString  = '/list?advanced=true&table='+currentButton.replace('#','');
    //if (fieldText) // <- ie: if the field has text in it
        //queryString += fieldName + "=" + fieldText
    if(tags.length > 0){
        queryString += '&tags='+tags.split(" ");
    }

    if(keywords.length > 0){
        queryString += '&keywords='+keywords;
    }

    if(exactWords.length > 0){
        queryString += '&exactPhrase='+exactWords;
        //replace(' ', '');
    }

    if(title.length > 0) {
        //var res = title.split(" ");
        queryString += '&titleContains='+title.split(" ");
    }
    //repeat for all fields

    location.href = queryString //add params here, it will reload the page
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