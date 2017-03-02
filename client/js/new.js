"use strict";

/*
* New.js
* Created by Michael Albinson 2/18/17
 */

function submitItem() {

    var content = {
        requested: "new",
        type: getPressed().replace('#', ''), //class, question, link
        content: getContent(getPressed().replace('#', ''))
    };

    if (!allFieldsFilled(content.type))
        return;

    var buttonName = '#' + content.type + '-button'; //once we've cleared the check to make sure required fields are filled, disable the button until we receive a response
    $(buttonName).prop('disabled', true);

    $.ajax({
        url: 'info',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function(data) {
        if (data) { // if we get a valid response, redirect to the new item
            if (data.id)
                document.location = '/' + content.type + '?id=' + data.id;
            else
                console.error('There was a problem');
        }

        else { // otherwise we need to let the user know something went wrong
            // at some point show "something went wrong" modal
            console.error("Server Responded in an Unexpected Fashion");
        }
        $(buttonName).prop('disabled', false);
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        console.log(err);
    });
}

// get the current item type that will
function getPressed() {
    return currentButton;
}

function getContent(type) {
    if (type == "class")
        return {
            title: $('#classTitle').val(), //TODO: need to reflect things actually allowed to be inputted on the class table
            courseCode: $('#courseCode').val(),
            summary: $('#classSummary').val(),
            tags: getTags('#classTags'),
            instructor: $('#instructor').val(),
            credit: $('#credit').val(),
            prereqs: $('#prerequisites').val()
        };
    else if (type == "link")
        return {
            title: $('#linkTitle').val(),
            summary: $('#linkSummary').val(),
            href: $('#url').val(),
            tags: getTags('#linkTags')
        };
    else if (type == "question")
        return {
            title: $('#questionTitle').val(),
            summary: $('#details').val(),
            tags: getTags('#questionTags')
        };
    else {
        console.error('invalid request type');
        return undefined;
    }
}

// gets the content of the tag field and structures them properly for the database
function getTags(id) {
    var tags = $(id).val();
    tags = tags.replace(new RegExp(' ', 'g'), ', ');
    return tags;
}

/*
* Logic for toggling buttons
*/
var currentButton = '';
function toggleSelection(button) {
    $(currentButton).removeClass('active');
    currentButton = "#" + button;
    $(currentButton).addClass('active');
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
});

/*
* Form handling and checking
 */

const reqClass = ['#courseCode', '#classTitle', '#classSummary', '#instructor', '#credit'];
const reqLink = ['#url', '#linkTitle', '#linkSummary'];
const reqQ = ['#questionTitle', '#details'];
function allFieldsFilled(type) {
    switch(type) {
        case ("class"):
            return checkFields(reqClass, type);
        case ("link"):
            return checkFields(reqLink, type);
        case ("question"):
            return checkFields(reqQ, type);
        default:
            console.log('How did you get here? You shouldn\'t be here!');
            return false;
    }
}

function checkFields(fields, type) {
    var warnAbout = '';
    for (var field in fields) {
        if (!fields.hasOwnProperty(field))
            continue;

        var current = $(fields[field]);
        if(!current.val()) {
            addWarning(current);
            if (warnAbout)
                warnAbout += ',';

            warnAbout += ' ' + current.attr('id').replace(type, '').toLowerCase();

        }
        else
            removeWarning(current);
    }

    if (warnAbout) {
        $('#warning-target-' + type).text('Please fill out the following required field(s):' + warnAbout);
        return false;
    }
    else {
        $('#warning-target-' + type).text(warnAbout);
        return true;
    }
}

function addWarning(field) {
    field.addClass('form-control-danger');
    field.parent().addClass('has-danger')
}

function removeWarning(field) {
    field.removeClass('form-control-danger');
    field.parent().removeClass('has-danger');
}