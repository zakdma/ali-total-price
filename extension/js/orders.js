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
        var heads = jQuery('tr.order-head');
        var list = '';
        heads.each(function (index, el) {
            var row = jQuery(el);
            var orderNumber = row.find("td.order-info p.first-row span.info-body").text().trim();
            var orderAmount = row.find("td.order-amount p.amount-num").text().trim();
            orderAmount = orderAmount.replace(/[^\d\.,]/g, '');
            list += orderNumber + "\t" + orderAmount + "\n";
        });
        textArea.text(list);
        textArea.css({display: 'block'});
    }
}
