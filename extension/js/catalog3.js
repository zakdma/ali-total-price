/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

console.log = function() {};

/**
 * Subscribe event and inject script that retrieve local data from page window object
 * It needed because content script is working in sandbox and have no access to page local data.
 */
function atpHandlePrices()
{
    console.log("Ali: Start timer");
    setInterval(atpStartProcessing, 500);
}

/**
 * Start processing items
 */
function atpStartProcessing()
{
    console.log("Ali: Start processing catalog list items");
    // Get all product list items from current page
    var items = jQuery('.list-items .list-item:not([data-processed])');
    console.log("Ali: Not processed items fount: " + items.length);
    // Iterate though each item and show total price
    items.each(function (index) {
        var item = jQuery(this);
        atpProcessItem(item);
    });
}

function atpProcessItem(item) {
    var productId = atpGetProductId(item);
    console.log("Ali: Start processing single item: "+productId);
    var price = atpGetItemPrice(item);
    var shipping = getItemShippingCost(item);
    console.log("Ali: " + productId);
    console.log("Ali: price");
    console.log(price);
    console.log("Ali: shipping");
    console.log(shipping);
    if (price != null) {
        item.attr('data-processed', true);
        // var minPrice = price.prices[0].value;
        // var maxPrice = minPrice;
        // if (price.prices.length > 1) {
        //     maxPrice = price.prices[1].value;
        // }

        var priceRow = item.find('.item-price-wrap');
        var priceRowShipping = priceRow.clone();
        priceRowShipping.addClass('atp-shipping-cost');
        var valueContainer = priceRowShipping.find('.price-current');

        var value = atpCalculateItemShippingCost(price, shipping.prices[0].value ? shipping.prices[0].value : 0);
        if (value.length) {
            valueContainer.text(value);
            priceRow.after(priceRowShipping);
        }
    }
}

function atpGetProductId(item)
{
    var productId = null;
    var data = item.find('.product-card').attr('data-product-id');
    if (data) {
        productId = data;
    }

    return productId;
}

function atpCalculateItemShippingCost(price, shippingCost) {
    var value = '';
    value = price.prices[0].format.prefix;
    var priceValue = price.prices[0].value + shippingCost;
    value += priceValue.atpFormatNumber(
        price.prices[0].format.decimalSeparator,
        price.prices[0].format.thousandSeparator
    );
    if (price.prices.length > 1) {
        priceValue = price.prices[1].value + shippingCost;
        value += ' - ' + priceValue.atpFormatNumber(
            price.prices[1].format.decimalSeparator,
            price.prices[1].format.thousandSeparator
        );
    }
    value += price.prices[0].format.suffix;

    return value;
}

/**
 * Get product item shipping cost value.
 *
 * @param item
 * @returns {Object}
 */
function getItemShippingCost(item)
{
    return atpGetItemValue(item, '.item-shipping-wrap .shipping-value');
}

/**
 * Get product item price cost value(s).
 *
 * @param item
 * @returns {Object}
 */
function atpGetItemPrice(item)
{
    return atpGetItemValue(item, '.item-price-wrap .price-current');
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
        suffix: '',
        prices: []
    };
    var regex = /\d/g;
    var match,
        matchCount = 1,
        startPos = -1,
        endPos = -1,
        valueClear = value;

    while(match = regex.exec(value)){
        if (matchCount == 1) {
            startPos = regex.lastIndex - 1;
        }
        endPos = regex.lastIndex - 1;
        matchCount++;
    }

    if (startPos > 0) {
        result.prefix = value.substr(0, startPos);
    }
    if (endPos < value.length - 1) {
        result.suffix = value.substr(endPos + 1);
    }

    startPos = startPos > 0 ? startPos : 0;
    endPos = endPos > 0 ? endPos : value.length;
    valueClear = value.substr(startPos, endPos - startPos + 1);

    var prices = valueClear.split('-');
    for(var i = 0; i < prices.length; i++) {
        var price = atpParsePrice(prices[i]);
        price.format.prefix = result.prefix;
        price.format.suffix = result.suffix;
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
        second: '00',
        format: {
            decimalSeparator: '.',
            thousandSeparator: ''
        },
        value: NaN
    };

    //value = value.replace(/[^\d,\.]/g, '');
    value = value.trim();
    //console.log(value);

    // Extract decimal separator (point)
    var lastIndex = value.regexLastIndexOf(/[^\d]/g);
    if (lastIndex >= 0) {
        result.first = value.substr(0, lastIndex);
        result.second = value.substr(lastIndex + 1);
        result.format.decimalSeparator = value.substr(lastIndex, 1);

        if (result.second.length == 3) { // Maybe there is no decimal point in this number
            result.first = value;
            result.second = '00';
            if (result.format.decimalSeparator == ',') {
                result.format.decimalSeparator = '.';
            } else {
                result.format.decimalSeparator = ',';
            }
        }
    } else {
        result.first = value;
    }

    // Extract thousand separator
    lastIndex = result.first.regexLastIndexOf(/[^\d]/g);
    if (lastIndex >= 0) {
        result.format.thousandSeparator = result.first.substr(lastIndex, 1);
    }
    result.first = result.first.replace(/[^\d]/g, '');
    result.value = Number(result.first + '.' + result.second);

    //console.log(value+': '+result.first+'|'+result.second+'|'+result.splitter+'|'+result.value+'|');
    return result;
}
