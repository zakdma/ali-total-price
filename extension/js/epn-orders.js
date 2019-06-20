/*
 * This file is part of AliTotalPrice <https://github.com/zakdma/ali-total-price>
 * Copyright (C) 2018 Myroslav Dobra (myroslav.dobra@gmail.com).
 * See LICENSE.md for license details.
 */

atpOrdersList();

function atpOrdersList()
{
    var container = jQuery('div.table-container');
    if (container.length) {
        var buttonText = '<div><button id="atp-orders-list-button" class="el-button el-button--primary">Get list</button><textarea id="atp-orders-list-area" style="width: 100%; display: none" rows="11"></textarea></div>';
        container.before(buttonText);
        jQuery('#atp-orders-list-button').on('click', atpOrdersListButtonClick);
        container.parent().append('<textarea id="atp-orders-list-area" style="width: 100%; display: none" rows="11"></textarea>');
    }
}

function atpOrdersListButtonClick(event) {
    //number: td p.table-number a
    //amount: $('td span:not([class])')

    var textArea = jQuery('#atp-orders-list-area');
    if (textArea.length) {
        var rows = jQuery('div.table-history tr');
        var list = '';
        rows.each(function (index, el) {
            var row = jQuery(el);
            var orderNumber = row.find("td p.table-number a").text().trim();
            var orderAmount = row.find('td span:not([class])').text().trim();
            orderAmount = orderAmount.replace(/[^\d\.,]/g, '');
            list += orderNumber + "\t" + orderAmount + "\n";
        });
        textArea.text(list);
        textArea.css({display: 'block'});
    }
}
