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

function subscribe(userid, itemid) {
    $.ajax({
        url: '/subscribe',
        type: 'POST',
        contentType: 'application/json', 
        data: JSON.stringify({userId: userid, itemId: itemid})
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

function vote(userid, itemid, votevalue) {
    $.ajax({
        url: '/vote',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({userId: userid, itemId: itemid, voteValue: votevalue})
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