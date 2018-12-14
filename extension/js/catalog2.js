/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

/**
 * Subscribe event and inject script that retrieve local data from page window object
 * It needed because content script is working in sandbox and have no access to page local data.
 */
function atpHandlePrices()
{
    //console.log("add event");
    document.addEventListener('atpLocalDataEvent', function (e) {
        var localData = e.detail;
        //console.log("received " + localData);
        atpStartProcessing(localData);
    });

    //console.log("inject");
    atpInjectScriptIntoPage('js/injection.js');
}

/**
 * Start processing items after local data received
 */
function atpStartProcessing(localData)
{
    // Get all product list items from current page
    var items = jQuery('.list-item');
    // Iterate though each item and show total price
    items.each(function (index) {
        var item = jQuery(this);
        atpProcessItem(item, localData);
    });
}

function atpProcessItem(item, localData) {
    var price = atpGetItemPrice(item);
    if (price != null) {
        var minPrice = price.prices[0].value;
        var maxPrice = minPrice;
        if (price.prices.length > 1) {
            maxPrice = price.prices[1].value;
        }
        var productId = atpGetProductId(item);
        if (productId) {
            item.atpProductId = productId;
            var shippingRequestData = atpCreateShippingRequestData(productId, minPrice, maxPrice, localData);
            atpSendShippingCostsRequest(item, shippingRequestData);
        }
    }
}

function atpGetProductId(item)
{
    var productId = null;
    var data = item.attr('qrdata');
    if (data) {
        var splitData = data.split('|', 3);
        if (splitData && splitData.length > 1) {
            productId = splitData[1];
        }
    }

    return productId;
}

function atpCreateShippingRequestData(productId, minPrice, maxPrice, localData)
{
    //window.runParams.ship_from
    //window.runParams.ship_to
    //window.runParams.p4pObjectConfig.Bcfg.currencyType: "USD"

    var shippingRequestData = {
        'productId': productId,
        'countryFromCode': localData.shipFrom,
        'countryToCode': localData.shipTo,
        'currencyCode': localData.currency,
        'transactionCurrencyCode': localData.currency,
        'minPrice': minPrice,
        'maxPrice': maxPrice,
        'timestamp': Date.now()
    };

    return shippingRequestData;
}

function atpSendShippingCostsRequest(item, shippingRequestData)
{
    var url = atpRequestShippingRatesUrl(shippingRequestData);

    var priceRow = item.find('span.price');
    var priceRowLoader = priceRow.clone();
    priceRowLoader.attr('id', 'atp-item-loader-' + item.atpProductId);
    priceRowLoader.addClass('atp-item-loader');
    priceRowLoader.html('<span class="atp-loader-spinner"></span>');
    priceRow.after(priceRowLoader);

    var itemData = {
        "item": item,
        "requestData": shippingRequestData,
        "loaderContainer": priceRowLoader
    };

    jQuery.ajax({
        'url': url,
        'method': 'GET',
        'cache': false,
        'dataType': 'text',
        'context': itemData
    }).fail(function(jqXHR, textStatus, errorThrown) {
        atpShippingCostsErrorHandler(this);
    }).always(function(data, textStatus, jqXHR) {
        //console.log("always");
    }).done(function(data, textStatus, jqXHR) {
        atpShippingCostsResponseHandler(data, this);
    });
}

function atpShippingCostsResponseHandler(data, itemData)
{
    var json = data.trim();
    json = json.substr(1, json.length - 2);
    var rates = JSON.parse(json);
    if (rates && rates.hasOwnProperty('freight') && rates.freight.length > 0) {
        var rate = null;
        for(var i = 0; i < rates.freight.length; i++) {
            if (rates.freight[i].isDefault) {
                rate = rates.freight[i];
                break;
            }
        }
        atpRenderShippingCost(itemData, rate);
    } else {
        itemData.loaderContainer.remove();
    }
}

function atpRenderShippingCost(itemData, rate) {
    itemData.loaderContainer.remove();
    var priceRow = itemData.item.find('span.price');
    var priceRowShipping = priceRow.clone();
    priceRowShipping.addClass('atp-shipping-cost');
    var valueContainer = priceRowShipping.find('.value');

    var value = '';
    if (rate != null) {
        // Need to get price prefix like 'USD $'
        var shippingCostParsed = atpGetPriceValue(rate.localPriceFormatStr);
        value = shippingCostParsed.prefix;
        var priceValue = itemData.requestData.minPrice + 1*rate.localPrice;
        value += priceValue.toFixed(2).replace('.', shippingCostParsed.prices[0].splitter);
        if (itemData.requestData.maxPrice != itemData.requestData.minPrice) {
            priceValue = itemData.requestData.maxPrice + 1*rate.localPrice;
            value += ' - ' + priceValue.toFixed(2).replace('.', shippingCostParsed.prices[0].splitter);
        }
    }

    if (value.length) {
        valueContainer.text(value);
        priceRow.after(priceRowShipping);
    }
}

function atpShippingCostsErrorHandler(itemData)
{
    var message = 'Failed to load shipping rates for product ' + itemData.item.atpProductId;
    itemData.loaderContainer.html('<span title="' + message + '" class="error">Error</span>');
    atpLogToConsole(message);
}

function atpRequestShippingRatesUrl(shippingRequestData)
{
    var urlTpl = 'https://freight.aliexpress.com/ajaxFreightCalculateService.htm?f=d&productid={{productId}}&count=1&minPrice={{minPrice}}&maxPrice={{maxPrice}}&currencyCode={{currencyCode}}&transactionCurrencyCode={{transactionCurrencyCode}}&sendGoodsCountry={{countryFromCode}}&country={{countryToCode}}&province=&city=&abVersion=1&_={{timestamp}}';
    var url = urlTpl.atpSprintf(shippingRequestData);

    return url;
}

/**
 * Get product item shipping cost value.
 *
 * @param item
 * @returns {Object}
 */
function getItemShippingCost(item)
{
    return atpGetItemValue(item, '.pnl-shipping .value');
}

/**
 * Get product item price cost value(s).
 *
 * @param item
 * @returns {Object}
 */
function atpGetItemPrice(item)
{
    return atpGetItemValue(item, '.price-m .value');
}

/**
 * Get item value.
 *
 * @param item
 * @param selector
 * @returns {*}
 */
function atpGetItemValue(item, selector) {
    var value = item.find(selector).text() + '';
    value = value.trim();
    var result = null;
    if (value.length > 0) {
        result = atpGetPriceValue(value);
    }

    return result;
}

/**
 * Get price value(s) from price string string.
 *
 * It returns also prefix and prices if there are more then one.
 *
 * @param {string} value
 * @returns {Object}
 */
function atpGetPriceValue(value)
{
    var result = {
        prefix: '',
        prices: []
    };
    var prefixPos = value.search(/\d/g);
    if (prefixPos >= 0) {
        result.prefix = value.substr(0, prefixPos);
    }

    var prices = value.split('-');
    for(var i = 0; i < prices.length; i++) {
        var price = atpParsePrice(prices[i]);
        result.prices.push(price);
    }

    //console.log(value+': '+result.prefix);
    return result;
}

/**
 * Parse price value into main, fraction and delimiter.
 *
 * @param {string} value
 * @returns {Object}
 */
function atpParsePrice(value)
{
    //console.log(value);
    var result = {
        first: '',
        second: '',
        splitter: '',
        value: NaN
    };

    value = value.replace(/[^\d,\.]/g, '');
    //console.log(value);
    var lastIndex = value.regexLastIndexOf(/[^\d]/g);

    if (lastIndex >= 0) {
        result.first = value.substr(0, lastIndex);
        result.second = value.substr(lastIndex + 1);
        result.splitter = value.substr(lastIndex, 1);
    } else {
        result.first = value;
    }
    result.first = result.first.replace(/[^\d]/g, '');
    result.value = Number(result.first + '.' + result.second);

    //console.log(value+': '+result.first+'|'+result.second+'|'+result.splitter+'|'+result.value+'|');
    return result;
}
