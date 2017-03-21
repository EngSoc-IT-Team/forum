/* Common.js
 *  Created by Michael Albinson 12/20/17
 * A file that contains functionality core to the entire forum
 */

"use strict";

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

function subscribe(itemid, isSubscribed, type) {
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json', 
        data: JSON.stringify({itemId: itemid, subscribed: isSubscribed, action:"subscribe", contentType: type})
    }).done(function(data) {
        if (data) {
            // TODO: indicate the success 
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

function save(itemid, isSaved, type) {
    $.ajax({
        url: '/action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({itemId: itemid, saved: isSaved, action:"save", contentType: type})
    }).done(function(data) {
        if (data) {
            // TODO: indicate the success
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

function displayNewVotes(count, element) {
    if (count >= 0 && element.hasClass('negative'))
        element.removeClass('negative').addClass('positive');
    else if (count < 0 && element.hasClass('positive'))
        element.removeClass('positive').addClass('negative');

    element[0].innerHTML = count;
}

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
            console.log(data);
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
**
**
** This is a basic templating function that can be used to 
** fill a specified template using the template and arguments provided.
** Note that this function should be wrapped around for page-specific
** uses. 
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

/*
*  Makes our lovely svg elements function and appear properly
 */
jQuery(document).ready(function() {
    /* Replace all SVG images with inline SVG */
    svgConverter();
});

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