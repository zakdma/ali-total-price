/*
 * Copyright (C) 2018 Myroslav Dobra (dmaraptor@gmail.com).
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

function handlePrices() {
    // Get all product list items from current page
    var items = jQuery('.list-item');
    // Iterate though each item and show total price
    items.each(function (index) {
        var item = jQuery(this);
        var shippingCost = getItemShippingCost(item);
        var price = getItemPrice(item);

        if (shippingCost != null) {
            shippingCost = shippingCost.prices[0].value;
        } else {
            shippingCost = 0;
        }

        if (price != null) {
            var value = price.prefix;
            var first = true;
            for(var i = 0; i < price.prices.length; i++) {
                if (!first) {
                    value += ' - ';
                }
                var priceValue = price.prices[i].value + shippingCost;
                value += priceValue.toFixed(2).replace('.', price.prices[i].splitter);
                first = false;
            }

            var priceRow = item.find('span.price');
            var priceRowNew = priceRow.clone();
            //priceRowNew.css({background: '#FF4C4C', color: 'white'});
            priceRowNew.find('.value').text(value).css({background: '#FF4C4C', color: 'white'});
            priceRow.after(priceRowNew);
        }
    });
}

/**
 * Get product item shipping cost value.
 *
 * @param item
 * @returns {Object}
 */
function getItemShippingCost(item)
{
    return getItemValue(item, '.pnl-shipping .value');
}

/**
 * Get product item price cost value(s).
 *
 * @param item
 * @returns {Object}
 */
function getItemPrice(item)
{
    return getItemValue(item, '.price-m .value');
}

/**
 * Get item value.
 *
 * @param item
 * @param selector
 * @returns {*}
 */
function getItemValue(item, selector) {
    var value = item.find(selector).text() + '';
    value = value.trim();
    var result = null;
    if (value.length > 0) {
        result = getPriceValue(value);
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
function getPriceValue(value)
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
        var price = parsePrice(prices[i]);
        result.prices.push(price);
    }

    return result;
}

/**
 * Parse price value into main, fraction and delimiter.
 *
 * @param {string} value
 * @returns {Object}
 */
function parsePrice(value)
{
    var result = {
        first: '',
        second: '',
        splitter: '',
        value: NaN
    };

    value = value.replace(/[^\d,\.]/g, '');
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

    return result;
}


// var images = document.getElementsByTagName('img');
// alert(images.length);
// for (var i = 0, l = images.length; i < l; i++) {
//     images[i].src = 'http://placekitten.com/' + images[i].width + '/' + images[i].height;
// }


