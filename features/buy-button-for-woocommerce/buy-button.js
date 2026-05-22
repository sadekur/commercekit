/* global CK_BUY_BUTTON, jQuery */
(function ($) {
    'use strict';

    if (typeof CK_BUY_BUTTON === 'undefined') return;

    var isAjax    = CK_BUY_BUTTON.is_ajax === 'yes';
    var btnText   = CK_BUY_BUTTON.button_text || 'Buy Now';
    var ajaxUrl   = CK_BUY_BUTTON.ajax_url;
    var nonce     = CK_BUY_BUTTON.nonce;

    function ajaxBuyNow($btn, productId, variationId, quantity, variation) {
        $btn.prop('disabled', true).text('...');

        $.post(ajaxUrl, {
            action:       'ck_buy_button_add_to_cart',
            nonce:        nonce,
            product_id:   productId,
            variation_id: variationId || 0,
            quantity:     quantity    || 1,
            variation:    variation   || {},
        })
        .done(function (response) {
            if (response.success && response.data && response.data.redirect_url) {
                window.location.href = response.data.redirect_url;
            } else {
                $btn.prop('disabled', false).text(btnText);
            }
        })
        .fail(function () {
            $btn.prop('disabled', false).text(btnText);
        });
    }

    // Single product page Buy Now button.
    // type="button" so WooCommerce's form.cart submit handlers never fire.
    // All three paths are handled explicitly here.
    $(document).on('click', '.wc-buy-now-btn-single', function () {
        var $btn        = $(this);
        var $form       = $btn.closest('form.cart');
        var productId   = parseInt($btn.data('product-id'), 10);
        var productType = $btn.data('product-type');
        var isVariable  = productType === 'variable';
        var quantity    = parseInt($form.find('input.qty').val(), 10) || 1;

        if (isVariable) {
            // Variable: capture selected variation, always use AJAX.
            var variationId = parseInt($form.find('input[name="variation_id"]').val(), 10) || 0;

            if (variationId === 0) {
                alert(CK_BUY_BUTTON.i18n_select_options);
                return;
            }

            var variation = {};
            $form.find('[name^="attribute_"]').each(function () {
                variation[$(this).attr('name')] = $(this).val();
            });

            ajaxBuyNow($btn, productId, variationId, quantity, variation);

        } else if (isAjax) {
            // Simple + AJAX on: use AJAX.
            ajaxBuyNow($btn, productId, 0, quantity, {});

        } else {
            // Simple + AJAX off: GET redirect; template_redirect catches wc-quick-buy-now.
            var base = window.location.href.split('?')[0].split('#')[0];
            window.location.href = base + '?wc-quick-buy-now=' + productId + '&quantity=' + quantity;
        }
    });

})(jQuery);
