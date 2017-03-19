"use strict";

/*
* New.js
* Created by Michael Albinson 2/18/17
 */

var select2Options = {data: [], tags: true, tokenSeparators: [',', ' '], width: 'resolve',
    theme: "classic",  maximumSelectionLength: 3, forcebelow: true};

var tagArray = [];

function getTagArray() {
    var content = {
        action: "tag",
        sub: "getArray"
    };

    $.ajax({
        url: 'action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function(data) {
        if (data) { // if we don't get here that's ok,
            tagArray = data;
            select2Options.data = data;
            $('#questionTags').select2(select2Options);
            $('#classTags').select2(select2Options);
            $('#linkTags').select2(select2Options);

        }

        else { // otherwise we need to let the user know something went wrong
            // we just let ourselves know that tags
            console.error("Couldn't get tags");
        }
    }).fail(function(err) {
        // at some point show "something went wrong" modal
        console.log(err);
    });
}

function submitItem() {
    var content = {
        requested: "new",
        type: getPressed().replace('#', ''), //class, question, link
        content: getContent(getPressed().replace('#', ''))
    };

    if (!checkFields(content.type))
        return;

    addMissingTags(content.content.rawTags);

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

function addMissingTags(tags) {
    for (var tag in tags) {
        if (!tags.hasOwnProperty(tag))
            continue;

        if (!tagArray.includes(tags[tag]))
            addTag(tags[tag]);
    }
}

function addTag(tagName) {
    var content = {
        tagName: tagName,
        action: "tag",
        sub: "add"
    };

    $.ajax({
        url: 'action',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content)
    }).done(function() {
        console.log("Tag '" + tagName + "' added"); //We don't really need to wait for this to happen
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
    var tags;
    if (type == "class") {
        tags = getTags('#classTags');
        return {
            title: $('#classTitle').val(),
            courseCode: $('#courseCode').val(),
            summary: CKEDITOR.instances.classSummary.getData(),
            instructor: $('#instructor').val(),
            credit: $('#credit').val(),
            prereqs: $('#prerequisites').val(),
            tags: tags[1],
            rawTags: tags[0]
        };
    }
    else if (type == "link") {
        tags = getTags('#linkTags');
        return {
            title: $('#linkTitle').val(),
            summary: CKEDITOR.instances.linkSummary.getData(),
            href: $('#url').val(),
            tags: tags[1],
            rawTags: tags[0]
        };
    }
    else if (type == "question") {
        tags = getTags('#questionTags');
        return {
            title: $('#questionTitle').val(),
            summary: CKEDITOR.instances.details.getData(),
            tags: tags[1],
            rawTags: tags[0]
        };
    }
    else {
        console.error('invalid request type');
        return undefined;
    }
}

// gets the content of the tag field and structures them properly for the database
function getTags(id) {
    var tags = $(id).val();
    var neat = "";
    for (var i = 0; i < tags.length; i++) {
        neat += tags[i].toUpperCase();

        if (i < tags.length - 1)
            neat += ", ";
    }

    return [tags, neat];
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

const requiredFields = {"class": {editor: 'classSummary', fields: ['#courseCode', '#classTitle','#instructor', '#credit']},
                link: {editor: "linkSummary", fields: ['#url', '#linkTitle']},
                question: {editor: 'details', fields: ['#questionTitle']}};

function checkFields(type) {
    var warnAbout = '';
    for (var field in requiredFields[type].fields) {
        if (!requiredFields[type].fields.hasOwnProperty(field))
            continue;

        var current = $(requiredFields[type].fields[field]);
        if(!current.val()) {
            addWarning(current);
            if (warnAbout)
                warnAbout += ',';

            warnAbout += ' ' + current.attr('id').replace(type, '').toLowerCase();
        }
        else
            removeWarning(current);
    }

    if (!CKEDITOR.instances[requiredFields[type].editor].getData().trim()) {
        if (warnAbout)
            warnAbout += ',';

        warnAbout += ' ' + requiredFields[type].editor.replace(type, '').toLowerCase();
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

function suggestTag(parent) {
    parent = $(parent);
    if (tagArray.includes(parent.val())) {
        parent[0].innerHTML = tagArray[tagArray.indexOf(parent.val())];
        console.log(tagArray[tagArray.indexOf(parent.val())]);
    }
}

$(document).ready(function() {
    getTagArray();
});



