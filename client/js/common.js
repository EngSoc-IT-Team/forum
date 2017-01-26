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

function vote(itemid, votevalue) {
    $.ajax({
        url: '/vote',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({itemId: itemid, voteValue: votevalue})
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