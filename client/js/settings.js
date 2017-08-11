/**
** Settings.js
 * By Michael Albinson 19/07/17
 */

"use strict";

var OGSettings = {notifications: true, searchable: true, neat: false, fancy: false};
var currentSettings = {};
for (var setting in OGSettings)
     currentSettings[setting] = OGSettings[setting]

function whenLoaded() {
    startPulsing();

    var content = {action: "get", type: 'settings'};
    var href = '/handlers';

    // AJAXCall(href, content, )
    fillInUserSettings(OGSettings);
    stopPulsing();
}

function submitChangedSettings() {

}

function toggle(el) {
    if (event.keyCode !== 13 && event.type !== "click")
        return;
    else if (event.keyCode === 13)
        $(el).click();

    currentSettings[$(el)[0].id] = $(el)[0].checked;

    if (isSettingChange())
        $('#saveChanges').removeAttr('disabled');
    else
        $('#saveChanges').attr('disabled', 'true');
}

function saveSettingsChanges() {
    if (!isSettingChange())
        return;

    var content = {action: "change", type: 'settings', settings: currentSettings};
    var href = '/handlers';
    //AJAXCall(href, content, false, onSuccess, false, false, document.relaod()))
}

function fillInUserSettings(settings) {
    for (var setting in settings) {
        if (settings.hasOwnProperty(setting) && settings[setting])
            $('#' + setting.toString()).click()
    }
}

function isSettingChange() {
    for (var setting in OGSettings) {
        if (OGSettings.hasOwnProperty(setting) && currentSettings.hasOwnProperty(setting)
            && OGSettings[setting] !== currentSettings[setting])
            return true;
    }

    return false;
}

$().ready(whenLoaded);