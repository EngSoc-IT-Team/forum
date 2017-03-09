/*
 * evalUtil.js
 * Written by Michael Albinson 3/8/17
 *
 * A set of functions added to the evalEnvironment namespace
 * for developer use only
 */

"use strict";

var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals');

var mockDataTemplate = '"##": {0}';

/* getMockData(url)
 *
 * A function to get all the info necessary to paste new rows into mock data rapidly
 */
exports.getMockData = function(url) {
    var tableMap = {'question': lit.POST_TABLE, 'link': lit.LINK_TABLE, 'class': lit.CLASS_TABLE};
    var returnString;
    var table = tableMap[url.slice(url.lastIndexOf('/') + 1, url.indexOf('?'))];
    var id =  url.slice(url.indexOf('=') + 1);

    return new Promise(function(resolve, reject) {
        var item = new DBRow(table);
        item.getRow(id).then(function() {
            if (!item.count())
                return resolve('No row found');

            returnString = fillTemplate(mockDataTemplate, getRowData(item, table)) + ',\n';

            var contr = new DBRow(lit.CONTRIBUTION_TABLE);
            contr.addQuery(lit.FIELD_ITEM_ID, item.getValue(lit.FIELD_ID));
            contr.query().then(function() {
                if(!contr.next())
                    return resolve(returnString);

                returnString += fillTemplate(mockDataTemplate, getRowData(contr, lit.CONTRIBUTION_TABLE)) + ',\n';
                var itemRow = new DBRow(lit.ITEM_TABLE);
                itemRow.addQuery(lit.FIELD_ITEM_ID, item.getValue(lit.FIELD_ID));
                itemRow.query().then(function() {
                    if(!itemRow.next())
                        return resolve(returnString);

                    returnString += fillTemplate(mockDataTemplate, getRowData(itemRow, lit.ITEM_TABLE));
                    console.log(returnString);
                    resolve(returnString);
                });
            });
        }, function() {
            resolve(returnString);
        }).catch(function(err) {
            reject(err)
        });
    });
};

function fillTemplate(temp) {
    var completedTemplate = temp;
    var replaceThis;
    for (var i=1; i<arguments.length; i++){
        replaceThis = "{" + (i - 1) + "}";
        completedTemplate = completedTemplate.replace(replaceThis, arguments[i]);
    }

    return completedTemplate;
}

function formatJSON(obj) {
    var objStr;
    objStr = JSON.stringify(obj)
        .replace(new RegExp('",', 'g'), '",\n\t')
        .replace(new RegExp('0,', 'g'), '0,\n\t')
        .replace(new RegExp('1,', 'g'), '1,\n\t')
        .replace(new RegExp('2,', 'g'), '2,\n\t')
        .replace(new RegExp('3,', 'g'), '3,\n\t')
        .replace(new RegExp('4,', 'g'), '4,\n\t')
        .replace(new RegExp('5,', 'g'), '5,\n\t')
        .replace(new RegExp('6,', 'g'), '6,\n\t')
        .replace(new RegExp('7,', 'g'), '7,\n\t')
        .replace(new RegExp('8,', 'g'), '8,\n\t')
        .replace(new RegExp('9,', 'g'), '9,\n\t')
        .replace(new RegExp('{', 'g'), '{\n\t')
        .replace(new RegExp('}', 'g'), '\n}')
        .replace(new RegExp(':', 'g'), ': ');
    return objStr
}

function getDateString(date) {
    if (!date)
        return undefined;

    date = new Date(date).toISOString();
    return date.slice(0, date.indexOf('T'));
}

function getRowData(r, table) {
    var info = {};
    info.table = table;
    var data = r.getRowJSON();
    for (var prop in data) {
        if (!data.hasOwnProperty(prop))
            continue;

        info[prop] = data[prop]
    }

    info.timestamp = getDateString(info.timestamp);

    return formatJSON(info);
}