/* Common.js
 *  Created by Michael Albinson 12/20/17
 * A file that contains functionality core to the entire forum
*/

"use strict";

/**
 * Allows the user to log out of the website, redirects to the login page if the logout is successful
 */
function logout() {
    $.ajax({
        url: '/logout',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({logout: true})
    }).done(function(data) {
        if (data)
            location.href = '/login';
        else {
            // TODO: display some error message
            console.log(data);
        }
    }).fail(function(err) {
        console.error(err);
    });
}

/** Adds a subscription for the current user for the selected item in the database
 *
 * @param el: the HTML subscribe button element attached to the item being subscribed to
 */
function subscribe(el) {
    el = $(el);
    var itemID = el.parent().parent().attr('id');
    var itemType = el.parent().parent().attr('data-hastype');

    // send the subscription to the server
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({itemId: itemID, subscribed: false, action: "subscribe", contentType: itemType})
    }).done(function(data) {
        if (data) {
            // TODO: indicate the success, change "subscribe" to "unsubscribe"
            console.log("Successful subscription");
        }
        else {
            // TODO: display some error message
            console.log(data);
        }
    }).fail(function(err) {
        console.error(err);
    });
}

/** Adds a save for the current user for the selected item in the database
 *
 * @param el: the HTML save button element attached to the item being saved
 */
function save(el) {
    el = $(el);
    var itemID = el.parent().parent().attr('id');
    var itemType = el.parent().parent().attr('data-hastype');

    // send the save to the server
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({itemId: itemID, saved: false, action: "save", contentType: itemType})
    }).done(function(data) {
        if (data) {
            // TODO: indicate the success, change "save" to "unsave"
            console.log("Successful save");
        }
        else {
            // TODO: display some error message
            console.log(data);
        }
    }).fail(function(err) {
        console.error(err);
    });
}

/** Adds or changes a vote on the selected item for the current use in the database and on the page
 *
 * @param el: the HTML thumbs up or thumbs down button that has been clicked, used to get the metadata for the item being voted on
 */
function vote(el) {
    el = $(el);
    var itemID = el.parent().parent().attr('id');
    var voteValue;
    var hasVoted = el.parent().parent().attr('data-hasvoted');
    var itemType = el.parent().parent().attr('data-hastype');
    var thumbsUpFills = el.parent().children('.thumbs-up').children().children().children().children(); // I <3 jQuery
    var thumbsDownFills = el.parent().children('.thumbs-down').children().children().children();
    var votes = el.parent().children('#votes');
    var currentVotes = votes[0].innerHTML;
    var voteCount;

    if (el.hasClass('thumbs-up') && hasVoted != 'positive') {
        voteValue = 1;
        if(thumbsDownFills.hasClass('negative'))
            thumbsDownFills.removeClass('negative');

        thumbsUpFills.addClass('positive');
        if (hasVoted == 'negative')
            voteCount = Number(currentVotes) + 2;
        else
            voteCount = ++currentVotes;

        displayNewVotes(voteCount, votes);

        el.parent().parent().attr('data-hasVoted', 'positive');
    }
    else if (el.hasClass('thumbs-down') && hasVoted != 'negative') {
        voteValue = 0;
        if(thumbsUpFills.hasClass('positive'))
            thumbsUpFills.removeClass('positive');

        thumbsDownFills.addClass('negative');
        if (hasVoted == 'positive')
            voteCount = Number(currentVotes) - 2;
        else
            voteCount = --currentVotes;

        displayNewVotes(voteCount, votes);

        el.parent().parent().attr('data-hasVoted', 'negative');
    }
    else
        return; // they already voted on the thumb they selected

    hasVoted = hasVoted == 'positive' || hasVoted == 'negative'; // true if data-hasvoted has been set, false otherwise

    // send the vote to the server
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({itemId: itemID, value: voteValue, voted: hasVoted, type: itemType, action:"vote"})
    }).done(function(data) {
        if (data) {
            // TODO: indicate the success
            console.log("Successful vote");
        }
        else {
            // TODO: display some error message
            console.log(data);
        }
    }).fail(function(err) {
        console.error(err);
    });
}

function ratingVote(el) {
    el = $(el);
    var itemID = el.parent().parent().attr('id');
    var voteValue;
    var hasVoted = el.parent().parent().attr('data-hasvoted');
    var itemType = el.parent().parent().attr('data-hastype');
    var votes = el.parent().parent().children('small').children('#votes');
    var currentVotes = votes[0].innerHTML;
    var voteCount;

    if (el.hasClass('thumbs-up') && hasVoted !== 'positive') {
        voteValue = 1;

        if (hasVoted === 'negative')
            voteCount = Number(currentVotes) + 2;
        else
            voteCount = ++currentVotes;

        displayNewVotes(voteCount, votes);

        el.parent().parent().attr('data-hasVoted', 'positive');
    }
    else if (el.hasClass('thumbs-down') && hasVoted !== 'negative') {
        voteValue = 0;

        if (hasVoted === 'positive')
            voteCount = Number(currentVotes) - 2;
        else
            voteCount = --currentVotes;

        displayNewVotes(voteCount, votes);

        el.parent().parent().attr('data-hasVoted', 'negative');
    }
    else
        return; // they already voted on the thumb they selected

    hasVoted = hasVoted === 'positive' || hasVoted === 'negative'; // true if data-hasvoted has been set, false otherwise

    // send the vote to the server
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({itemId: itemID, value: voteValue, voted: hasVoted, type: itemType, action:"vote"})
    }).done(function(data) {
        if (data) {
            // TODO: indicate the success
            console.log("Successful vote");
        }
        else {
            // TODO: display some error message
            console.log(data);
        }
    }).fail(function(err) {
        console.error(err);
    });
}

/** Changes the color of the vote count if necessary when a vote is added or changed
 *
 * @param count: the new vote count of the item
 * @param element: the vote count element that may need to be changed
 */
function displayNewVotes(count, element) {
    if (count >= 0 && element.hasClass('negative'))
        element.removeClass('negative').addClass('positive');
    else if (count < 0 && element.hasClass('positive'))
        element.removeClass('positive').addClass('negative');

    element[0].innerHTML = count;
}

/** Adds a child comment to a link, post, or comment in the database and adds it to the page
 *
 * @param el: the submit button on the HTML element being replied to
 */
function reply(el) {
    el = $(el);
    var editorID = el.parent().children('textarea').attr('id');
    var text = CKEDITOR.instances[editorID].getData();
    var replyLevel = (el.parent().parent().attr('data-hastype') == "comment") ? 1 : 0;
    var parentID;

    if (replyLevel)
        parentID = el.parent().parent().attr('id');

    if (!text.trim())
        return; // if there's no body to the comment don't add it

    var content = {sub:"add", action: "comment", parent: itemID, content: text, parentComment: parentID, level: replyLevel};
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function(data) {
        if (data) {
            data.votes = 1;
            data.date = "Just Now";
            var newComment;
            if (content.level) {
                newComment = fillCommentLevel2Template(data);
                $('#' + parentID).after(newComment);
            }
            else {
                newComment = fillCommentLevel1Template(data);
                $('#comments').prepend(newComment[0]);
                activateEditors(newComment[1]);
            }
            svgConverter();

            var foot = $('#foot');
            if (foot.length && foot.is(":visible"))
                foot.hide();
        }
        else {
            // at some point show "something went wrong" modal
            console.log('empty response');
        }
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        console.log(err);
    });
}

/* fillTemplate(template [, strings, used, to, fill, template])
 *
 * This is a basic templating function that can be used to
 * fill a specified template using the template and arguments provided.
 * Note that this function should be wrapped around for page-specific
 * uses.
 *
 * @param template: the template to be filled, followed by the parameters used to fill it
 * @returns {*} the completed template
 */
function fillTemplate(template) {
    var completedTemplate = template;
    var replaceThis;
    for (var i=1; i<arguments.length; i++){
        replaceThis = "{" + (i - 1) + "}";
        completedTemplate = completedTemplate.replace(replaceThis, arguments[i]);
    }

    return completedTemplate;
}

/** A function used to convert svg images on each page into their path components so that they can later be manipulated
 * to change their appearance. Called each time new components with svg elements are added to the page.
 */
function svgConverter() {
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);
            updateElements();
        });
    });
}

/**
 * Adds the correct coloring to the thumbs up and thumbs down elements of comments and posts
 * Must be called after svgConverter, otherwise the elements will not be properly converted
 */
function updateElements() {
    for (var it in updateItemsWithPolarity) {
        if(!updateItemsWithPolarity.hasOwnProperty(it))
            continue;

        var update = updateItemsWithPolarity[it];
        if (update.polarity == 'positive')
            $('#' + update.id + ' .thumbs-up').children().children().children().children().addClass('positive');
        else
            $('#' + update.id + ' .thumbs-down').children().children().children().addClass('negative');
    }
}

/** Redirects to the list page with the query specified in the search bar
 *
 * @param el: the element where the search was made
 * @param direct: The query, if the query does not need to be gotten from a specific element
 */
function search(el, direct) {
    var query;
    if (!direct) {
        el = $(el);
        query = el.parent().parent().children('input').val()
    }
    else
        query = direct;

    if (!query)
        return;

    window.location = '/list?query=' + query;
}

/**
 * Appends the onkeydown event to all search bars so that when a user hits the enter key, calling the search function
 * with the value of the search bar.
 */
function appendOnkeydown() {
    var searcher = $('#search');
    if (searcher)
        searcher.keypress(function(e) {
            if (e.which == 13) { // 13 = the enter key
                search(false, searcher.val())
            }
        });
}

/**
 * I realized I repeated this all over the code and it was a mess, so I made it better! (DRY kiddies)
 * Generic AJAX call to POST to the server to retrieve information. Note that the arguments onSuccessNoData, onFailure,
 * and callback are all OPTIONAL, if you do not need these functions, simply do not pass them
 *
 * @param href: STRING The url to POST to
 * @param content: JSON The content to pass to the server
 * @param shouldPulse: BOOLEAN whether on not the logo should pulse while we process the request
 * @param onSuccessWithData: The function to pass the data object to if the call is successful MUST be a function
 * @param onSuccessNoData: The function to call if the call is successful but there is no data, pass false if no function is needed
 * @param onFailure: The function to call if the response fails, pass false if no function is needed
 * @param callback: The callback function to call regardless of the result of the AJAX call
 */
function AJAXCall(href, content, shouldPulse, onSuccessWithData, onSuccessNoData, onFailure, callback) {
    if (shouldPulse)
        startPulsing();

    $.ajax({
        url: href,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function(data) {
        if (data) {
            onSuccessWithData(data);
        }
        else {
            // at some point show "something went wrong RELOAD" modal
            executeIfObjectIsFunction(onSuccessNoData);
            console.error("Server Responded in an Unexpected Fashion");
        }
        finish(callback, false, shouldPulse);
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        executeIfObjectIsFunction(onFailure);
        finish(callback, err, shouldPulse);
    });
}

/** Helper function that deals with the result of the AJAX call and stops the logo pulsing
 *
 * @param callback: The callback function to call when the AJAX call completes
 * @param err: The server/response error object, if there was one
 * @param needCancelPulse: whether or not we need to cancel the pulsing logo
 */
function finish(callback, err, needCancelPulse) {
    if (needCancelPulse)
        stopPulsing();

    if (err)
        console.error(err);

    executeIfObjectIsFunction(callback);
}

/** Helper function to make sure that what is passed as an argument is a function and not something else
 *
 * @param func: Object to test
 */
function executeIfObjectIsFunction(func) {
    if (typeof func === 'function') // if the object is a function, execute it
        return func();

    if (func === undefined)
        return;

    if (func === {})
        return;

    console.error("Function passed to executeIfObjectIsFunction was not a function!");
}

/** Shortcut method to trigger a modal
 *
 * @param modalID
 */
function triggerModal(modalID) {
    $('#' + modalID).modal('show');
}

/**
 * Makes our lovely svg elements function and appear properly
 */
jQuery(document).ready(function() {
    /* Replace all SVG images with inline SVG */
    svgConverter();
    appendOnkeydown();
});

var currentButton = "#love";
function toggleFeedbackSelection(button) {
    $(currentButton).removeClass('active');
    currentButton = "#" + button;
    $(currentButton).addClass('active');
}

function sendFeedback() {
    var content = {
        requested: 'feedback',
        type: currentButton.replace('#', ''),
        feedbackContent: $('#feedback-text').val()
    };

    function onComplete() {
        $('#feedback').modal('hide');
    }

    function onFailure() {
        $('#feedback').modal('hide');
    }

    AJAXCall('/info', content, false, onComplete, onComplete, onFailure);
}