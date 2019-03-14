/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

String.prototype.regexLastIndexOf = function(regex, startpos) {
    regex = (regex.global) ?
        regex :
        new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = this.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }

    return lastIndexOf;
};

String.prototype.atpReplaceAll = function(search, replacement)
{
    var target = this;

    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.atpSprintf = function(data)
{
    var result = this;
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            result = result.atpReplaceAll('{{' + key + '}}', data[key]);
        }
    }

    return result;
};

function atpLogToConsole(message) {
    if(window.console) {
        console.log(message);
    }
}

function atpInjectScriptIntoPage(scriptName)
{
    var s = document.createElement('script');
    // TODO: add "scriptName" to web_accessible_resources in manifest.json
    s.src = chrome.extension.getURL(scriptName);
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

Number.prototype.atpFormatNumber = function(decimalSeparator, thousandSeparator)
{
    var result = this.toFixed(2);
    if (thousandSeparator.length > 0) {
        result = result.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    }
    result = result.replace('.', decimalSeparator);

    return result;
};
