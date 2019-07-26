/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

atpOrdersList();

function atpOrdersList()
{
    var header = jQuery('h3.page-title');
    if (header.length) {
        var buttonText = "&nbsp;<button id='atp-orders-list-button'>Get list</button>";
        header.append(buttonText);
        jQuery('#atp-orders-list-button').on('click', atpOrdersListButtonClick);
        header.parent().append('<textarea id="atp-orders-list-area" style="width: 100%; display: none" rows="11"></textarea>');
    }
}

function atpOrdersListButtonClick(event) {
    var textArea = jQuery('#atp-orders-list-area');
    if (textArea.length) {
        var rows = jQuery('#buyer-ordertable .order-item-wraper');
        var list = '';
        rows.each(function (index, el) {
            var row = jQuery(el);
            var orderNumber = row.find("tr.order-head td.order-info p.first-row span.info-body").text().trim();
            var orderStatus = row.find("tr.order-body td.order-status span").text().trim();
            var orderAmount = row.find("tr.order-head td.order-amount p.amount-num").text().trim();
            orderAmount = orderAmount.atpReplaceAll(/[^\d\.,]/g, '');
            if (orderStatus != "Closed"
                && orderStatus != "Awaiting Cancellation"
                && orderStatus != " Payment not yet confirmed"
                && orderStatus != "Awaiting payment"
            ) {
                //list += orderNumber + "\t" + orderStatus + "\t" + orderAmount + "\n";
                var orderItems = row.find("tr.order-body");
                orderItems.each(function (index1, el1) {
                    var item = jQuery(el1);
                    var numberHref = item.find('td.product-sets p.product-snapshot a').attr('href').trim();
                    var number = atpExtractOrderIdFromLink(numberHref);
                    var spans = item.find('td.product-sets p.product-amount span');
                    var itemSum = 0;
                    if (spans.length >= 2) {
                        var priceText = jQuery(spans[0]).text().trim();
                        var amountText = jQuery(spans[1]).text().trim();
                        var price = priceText.atpReplaceAll(/[^\d\.,]/g, "").trim();
                        var amount = amountText.atpReplaceAll(/[^\d\.,]/g, "").trim();
                        itemSum = price * amount;
                    }
                    list += number + "\t" + orderStatus + "\t" + itemSum.toFixed(2) + "\n";
                });
            }

        });
        textArea.text(list);
        textArea.css({display: 'block'});
    }
}

function atpExtractOrderIdFromLink(href) {
    var regex = /orderId=(\d+)/gi;
    var match, result;
    if(match = regex.exec(href)){
        result = match[1];
    }

    return result;
}
