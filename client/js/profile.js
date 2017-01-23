"use strict";

function whenLoaded() {
	var href;
    var content = {
		requested: "profile",
	};

    if (window.location.href.includes("?")) {
        $(personal).hide();
        content.self = false;
        href = '/info' + window.location.href.slice(window.location.href.indexOf('?'));
    }
    else {
        content.self = true;
        $(knowledge)[0].innerHTML = "I know about:"
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
	$(posts)[0].innerHTML = "Posts: " + profile.posts;
	$(comments)[0].innerHTML = "Comments: " + profile.comments;
	$(links)[0].innerHTML = "Links: " + profile.links;
	$(other)[0].innerHTML = "Other Contributions: " + profile.other;
	$(up)[0].innerHTML = "++" + profile.upvotes;
	$(down)[0].innerHTML = "--" + profile.downvotes;
	$(username)[0].innerHTML = profile.username;
	$(joined)[0].innerHTML = "Date Joined: " + profile.dateJoined.slice(0, profile.dateJoined.indexOf('T'));
}