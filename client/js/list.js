"use strict";

/*
* List.js
* Created by Michael Albinson 2/15/17
 */

// list page specific templates
var askAQuestion = "<h6 class='info-block show-links'>Didn't find what you were looking for? Ask it <a href='/new'>here!</a></h6>";

/**
 * A function that runs once the page is loaded, posts to the database to get items and displays them on the page.
 */
function whenLoaded() {
    var href;
    var content = {
        requested: "list"
    };

    if (window.location.href.includes("?"))
        href = '/info' + window.location.href.slice(window.location.href.indexOf('?'));
    else
        href = '/info';

    AJAXCall(href, content, true, svgConvertAndBuildList, showAskAQuestion, showAskAQuestion, undefined, undefined);
}

function svgConvertAndBuildList(data) {
    if (data[0].length < 20) {
        $('#getMore').hide();
        $('#foot').append(askAQuestion);
    }

    buildList(data[0], '#listHead');
    svgConverter();
}

function showAskAQuestion() {
    $('#getMore').hide();
    $('#foot').append(askAQuestion);
}

// indicate the index of the posts the page has received (they are returned in sets of 20)
var lastGotten = 0;

/**
 * getMore function exclusively for the list page.
 *
 * Used to get more items from the database and add them to the list.
 */
function getMore() {
    var href;
    if (window.location.href.includes("?"))
        href = '/action' + window.location.href.slice(window.location.href.indexOf('?'));
    else
        href = '/action';

    var content = {action: 'getMore', type: 'list', currentNum: lastGotten};

    $.ajax({
        url: href,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function(data) {
        if (data) {
            buildList(data[0]);
            svgConverter();
            lastGotten++;
        }
        else {
            // at some point show "something went wrong" modal
            $('#aProblemOccurred').modal('toggle');
        }
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        console.log(err);
    });
}

// render the page
$(document).ready(whenLoaded);