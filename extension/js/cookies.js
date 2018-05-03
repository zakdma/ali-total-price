/*
 * Copyright (C) 2018 Myroslav Dobra (dmaraptor@gmail.com).
 */

(function () {
    "use strict";

    var removeCookieFromSearchRequest = function(details) {
        console.log(details);
        //var bkg = chrome.extension.getBackgroundPage();
        //bkg.console.log('processing');
        details.requestHeaders.forEach(function(requestHeader){
            if (requestHeader.name.toLowerCase() === "cookie") {
                var newValue = processCookieStr(requestHeader.value);
                writeToConsole(newValue);
                requestHeader.value = newValue;
            }
        });

        return {
            requestHeaders: details.requestHeaders
        };
    };

    chrome.webRequest.onBeforeSendHeaders.addListener(
        removeCookieFromSearchRequest,
        {urls: ["*://*.aliexpress.com/af/*"]},
        ["blocking", "requestHeaders"]
    );
})();

var cookieToRemove = 'xman_us_f';

var processCookieStr = function(cookiesStr) {
    var cookieStrList = cookiesStr.split('; ');
    var newStrList = [];
    cookieStrList.forEach(function(cookieStr){
        cookieStr = cookieStr.trim();
        // Remove cookie from list (not add to new list) if it starts with 'xman_us_f='
        if (cookieStr.indexOf(cookieToRemove + '=') != 0) {
            newStrList.push(cookieStr);
        } else {
            writeToConsole('Cookie removed: ' + cookieStr);
        }
    });

    writeToConsole('headers out count: ' + newStrList.length);
    return newStrList.join("; ");
};

var writeToConsole = function (message)
{
    console.log(message);
};