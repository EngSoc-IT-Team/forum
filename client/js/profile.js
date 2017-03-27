"use strict";

/*
* Profile.js
* Created by Michael Albinson 2/15/17
 */

var commentTemplate = '<div>Ayrton fill me in</div>';

var reviewTemplate = '<div>Ayrton fill me in</div>';

var uid;

function whenLoaded() {
	var href;
    var content = {
		requested: "profile"
	};

    if (window.location.href.includes("?")) {
        $(personal).hide();
        content.self = false;
        href = '/info' + window.location.href.slice(window.location.href.indexOf('?'));
    }
    else {
        content.self = true;
        $(knowledge)[0].innerHTML = "I know about:";
        href = '/info';
    }

	$.ajax({
    	url: href,
    	type: 'POST',
    	contentType: 'application/json',
    	data: JSON.stringify(content)
    }).done(function(data) {
    	if (data) {
            if (!data.profile){
                $('#aProblemOccurred').modal('toggle');
                return;
            }

            animateVotingBar(data.profile.upvotes, data.profile.downvotes);
            fillInUserInfo(data.profile);
            fillInPostInfo(data.items);
            addTags(data.tags);
            svgConverter();
            CKEDITOR.replace('report-text');
        }
        else {
            // at some point show "something went wrong" modal
            console.log('empty response')
        }
    }).fail(function(err) {
        // at some point show "something went wrong" modal
    	console.log("Something went wrong");
    });
}


function animateVotingBar(upvotes, downvotes) {
	var ups = $(positive)[0];
	var down = $(negative)[0];
	var upinc = (upvotes / (upvotes + downvotes));
	var downinc = (downvotes / (upvotes + downvotes));
	var inc = 0;

    if (upinc > 0.99)
        $(positive).css('border-radius', '10px');
    else if (downinc > 0.99)
        $(negative).css('border-radius', '10px');

    var id = setInterval(frame, 7);
    function frame() {
        if (inc > 400) {
            clearInterval(id);
        }
        else {
            ups.style.width = (upinc / 4) * inc + "%";
            down.style.width = (downinc / 4) * inc + "%";
            inc++;
        }
    }
}

function fillInUserInfo(profile) {
    uid = profile.id;
	$(posts)[0].innerHTML = "Posts: " + profile.posts;
	$(comments)[0].innerHTML = "Comments: " + profile.comments;
	$(links)[0].innerHTML = "Links: " + profile.links;
	$(other)[0].innerHTML = "Other Contributions: " + profile.other;
	$(up)[0].innerHTML = "++" + profile.upvotes;
	$(down)[0].innerHTML = "--" + profile.downvotes;
	$(username)[0].innerHTML = profile.username;
	$(joined)[0].innerHTML = "Date Joined: " + profile.dateJoined.slice(0, profile.dateJoined.indexOf('T'));
}

function fillInPostInfo(items) {
    var html;
    var sub = $('#subscribed');
    var save = $('#saved');
    var contr = $('#contributions');


    if (items.subscribed.length != 0) {
        sub[0].innerHTML = "";
        buildList(items.subscribed, '#subscribed')
        sub.append('<a class="centered" href="javascript:void(0)" onclick="getMore(\'profile\', \'subscribed\')">v Load More v</a>')
    }

    if (items.saved.length != 0) {
        save[0].innerHTML = "";

        buildList(items.saved, '#saved')
        save.append('<a class="centered" href="javascript:void(0)" onclick="getMore(\'profile\', \'saved\')">v Load More v</a>')
    }

    if (items.contributions.length != 0) {
        contr[0].innerHTML = "";
        buildList(items.contributions, '#contributions')
        contr.append('<a class="centered" href="javascript:void(0)" onclick="getMore(\'profile\', \'contributions\')">v Load More v</a>')
    }
}

function addTags(tags) {
    var html = '';
    for (var i=0; i< tags.length; i++){
        html = $.parseHTML(fillTemplate(tag, tags[i], tags[i]))[0];
        if (html)
            $('#knowledge')[0].append(html);
    }
}

/**
 *
 * @param it object with form {
        id: item.getValue(lit.FIELD_ID),
        author: item.getValue(lit.FIELD_AUTHOR),
        content: item.getValue(lit.FIELD_CONTENT),
        netVotes: item.getValue(lit.FIELD_NETVOTES),
        parent: item.getValue(lit.FIELD_PARENT_POST),
        parentComment: item.getValue(lit.FIELD_PARENT_COMMENT),
        type: lit.COMMENT_TABLE,
        date: item.getValue(lit.FIELD_TIMESTAMP),
        voted: hasVoted
    };
 * @returns {*} the filled template for the comment, to be appended to the document
 */
function fillCommentTemplate(it) {
    return fillTemplate(commentTemplate);
}

/**
 *
 * @param it object with form {
        parent: item.getValue(lit.FIELD_PARENT),
        id: item.getValue(lit.FIELD_ID),
        rating: item.getValue(lit.FIELD_AVERAGE_RATING),
        author: item.getValue(lit.FIELD_AUTHOR),
        content: item.getValue(lit.FIELD_CONTENT),
        date: item.getValue('datetime'),
        type: lit.RATING_TABLE,
        voted: hasVoted
    }
 * @returns {*} the filled template for the review, to be appended to the document
 */
function fillReviewTemplate(it) {
    return fillTemplate(reviewTemplate);
}