/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

//console.log(document.readyState);
//console.log("inside inject");
if(document.readyState !== 'loading') {
    atpGetLocalData();
} else {
    document.addEventListener("DOMContentLoaded", function(event) {
        atpGetLocalData();
    });
}

function atpGetLocalData() {
    var localData = {
        shipFrom: window.runParams.ship_from,
        shipTo: window.runParams.ship_to,
        currency: window.runParams.p4pObjectConfig.Bcfg.currencyType
    };
    //console.log(window.runParams.ship_to);
    // Send data to content script through event
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("atpLocalDataEvent", true, true, localData);
    //console.log("dispatch event");
    document.dispatchEvent(evt);
}
