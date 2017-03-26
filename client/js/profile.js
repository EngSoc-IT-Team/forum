"use strict";

/*
* Profile.js
* Created by Michael Albinson 2/15/17
 */
var subscriptionTemplate = '<div class="item">\
                                <span><img class="thumbs-up" src="../assets/thumbsUp.svg"/></span>\
                                <span class="{0}">{1}</span>\
                                <span><img class="thumbs-down" src="../assets/thumbsDown.svg"/></span>\
                                <span><a href="/question?id={2}">{3}</a></span>\
                                <div class="date">Subscribed on: {4}</div>\
                                <div class="date">Author: <a href="/profile?username={5}">{6}</a></div>\
                                <div class="links" style="font-size: .75em;">\
                                    <a href="/question?id={7}">View</a> | \
                                    <a href="" onclick="subscribe(\'{8}\', \'{9}\', true)">Unsubscribe</a> | \
                                    <a href="" onclick="report(\'{10}\')">Report</a>\
                                </div>\
                                <hr>\
                            </div>';
var contributionTemplate = '<div class="item">\
                                <span><img class="thumbs-up" src="../assets/thumbsUp.svg"/></span>\
                                <span class="{0}">{1}</span>\
                                <span><img class="thumbs-down" src="../assets/thumbsDown.svg"/></span>\
                                <span><a href="/question?id={2}">{3}</a></span>\
                                <div class="date">Posted on: {4}</div>\
                                <p style="margin-bottom: 5px;">{5}</p>\
                                <div class="links" style="font-size: .75em;">\
                                    <a href="/question?id={6}" onclick="">View</a> | \
                                    <a href="" onclick="save(\'{7}\', \'{8}\', true)">Save</a>\
                                </div>\
                                <hr>\
                            </div>';
var savedTemplate = '<div class="item">\
                        <span><img class="thumbs-up" src="../assets/thumbsUp.svg"/></span>\
                        <span class="{0}">{1}</span>\
                        <span><img class="thumbs-down" src="../assets/thumbsDown.svg"/></span>\
                        <span><a href="/question?id={2}">{3}</a></span>\
                        <div class="date">Saved on: {4}</div>\
                        <div class="date">Author: <a href="/profile?username={5}">{6}</a></div>\
                        <div class="links" style="font-size: .75em;">\
                            <a href="/question?id={7}">View</a> | \
                            <a href="" onclick="save(\'{8}\', \'{9}\', true)">Unsave</a> | \
                            <a href="" onclick="report(\'{10}\')">Report</a>\
                        </div>\
                        <hr>\
                    </div>';

var tag = '<button class="btn btn-sm question-tag" onclick="window.location = \'/list?tag={0}\'" type="submit">{1}</button>';
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
    if (items.subscribed.length != 0) {
        $('#subscribed')[0].innerHTML = "";

        for (var i = 0; i < items.subscribed.length; i++) {
            html = $.parseHTML(fillSubscriptionTemplate(items.subscribed[i]))[0];
            if (html)
                $('#subscribed').append(html);
        }
    }

    if (items.saved.length != 0) {
        $('#saved')[0].innerHTML = "";

        for (var i = 0; i < items.saved.length; i++) {
            html = $.parseHTML(fillSavedTemplate(items.saved[i]))[0];
            if (html)
                $('#saved').append(html);
        }
    }

    if (items.contributions.length != 0) {
        $('#contributions')[0].innerHTML = "";
        for (var i = 0; i < items.contributions.length; i++) {
            html = $.parseHTML(fillContributionTemplate(items.contributions[i]))[0];
            if (html)
                $('#contributions').append(html);
        }
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

function fillSubscriptionTemplate(subscr) {
    if (subscr.votes >= 0)
        return fillTemplate(subscriptionTemplate, "positive", subscr.votes, subscr.id, subscr.title, getDateString(subscr.date), subscr.author, subscr.author, subscr.id, uid, subscr.id, subscr.id);
    else
        return fillTemplate(subscriptionTemplate, "negative", subscr.votes, subscr.id, subscr.title, getDateString(subscr.date), subscr.author, subscr.author, subscr.id, uid, subscr.id, subscr.id);
}

function fillSavedTemplate(saved) {
    if (saved.votes >= 0)
        return fillTemplate(savedTemplate, "positive", saved.votes, saved.id, saved.title, getDateString(saved.date), saved.author, saved.author, saved.id, uid, saved.id, saved.id);
    else
        return fillTemplate(savedTemplate, "negative", saved.votes, saved.id, saved.title, getDateString(saved.date), saved.author, saved.author, saved.id, uid, saved.id, uid, saved.id);
}

function fillContributionTemplate(contr) {
    if (contr.votes >= 0)
        return fillTemplate(contributionTemplate, "positive", contr.votes, contr.id, contr.title, getDateString(contr.date), contr.summary, contr.id, uid, contr.id, contr.id);
    else
        return fillTemplate(contributionTemplate, "negative", contr.votes, contr.id, contr.title, getDateString(contr.date), contr.summary, contr.id, uid, contr.id, contr.id);
}

function getDateString(date) {
    if (!date)
        return undefined;

    return date.slice(0, date.indexOf('T'));
}
