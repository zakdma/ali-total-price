/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

(function () {
    "use strict";

    var removeCookieFromSearchRequest = function(details) {
        writeToConsole('Start processing');
        //var bkg = chrome.extension.getBackgroundPage();
        //bkg.console.log('processing');
        details.requestHeaders.forEach(function(requestHeader){
            if (requestHeader.name.toLowerCase() === "cookie") {
                var newValue = processCookieStr(requestHeader.value);
                requestHeader.value = newValue;
            }
        });

        writeToConsole('Finish processing');

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
    writeToConsole('Cookies in count: ' + cookieStrList.length);
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

    writeToConsole('Cookies out count: ' + newStrList.length);
    return newStrList.join("; ");
};

var writeToConsole = function (message)
{
    console.log(message);
};
