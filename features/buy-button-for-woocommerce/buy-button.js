/* global COMMERCEKIT, jQuery */
(function ($) {
    'use strict';

    var ckBB = COMMERCEKIT && COMMERCEKIT.buy_button;
    if (!ckBB) return;

    var isAjax  = ckBB.is_ajax === 'yes';
    var btnText = ckBB.button_text || 'Buy Now';
    var ajaxUrl = COMMERCEKIT.ajaxurl;
    var nonce   = ckBB.nonce;

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

    // Single product page — type="button" so WooCommerce form.cart submit never fires.
    $(document).on('click', '.wc-buy-now-btn-single', function () {
        var $btn        = $(this);
        var $form       = $btn.closest('form.cart');
        var productId   = parseInt($btn.data('product-id'), 10);
        var productType = $btn.data('product-type');
        var isVariable  = productType === 'variable';
        var quantity    = parseInt($form.find('input.qty').val(), 10) || 1;

        if (isVariable) {
            var variationId = parseInt($form.find('input[name="variation_id"]').val(), 10) || 0;

            if (variationId === 0) {
                alert(ckBB.i18n_select_options);
                return;
            }

            var variation = {};
            $form.find('[name^="attribute_"]').each(function () {
                variation[$(this).attr('name')] = $(this).val();
            });

            ajaxBuyNow($btn, productId, variationId, quantity, variation);

        } else if (isAjax) {
            ajaxBuyNow($btn, productId, 0, quantity, {});

        } else {
            var base = window.location.href.split('?')[0].split('#')[0];
            window.location.href = base + '?wc-quick-buy-now=' + productId + '&quantity=' + quantity;
        }
    });

    // Archive/shop page — variable products use their href (link to product page);
    // simple products always use AJAX regardless of the isAjax setting.
    $(document).on('click', '.wc-buy-now-btn-archive', function (e) {
        var $btn        = $(this);
        var productType = $btn.data('product_type');

        if (productType === 'variable') {
            return; // let the <a> href navigate to the product page
        }

        e.preventDefault();

        var productId = parseInt($btn.data('product_id'), 10);
        var quantity  = parseInt($btn.data('quantity'), 10) || 1;

        ajaxBuyNow($btn, productId, 0, quantity, {});
    });

})(jQuery);
