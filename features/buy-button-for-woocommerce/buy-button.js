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

    // Single product page Buy Now button
    $(document).on('click', '.wc-buy-now-btn-single', function (e) {
        var $btn         = $(this);
        var $form        = $btn.closest('form.cart');
        var productId    = parseInt($btn.val(), 10);
        var productType  = $btn.data('product_type');
        var isVariable   = productType === 'variable';

        // Variable products always go through AJAX (need to capture selected variation).
        // Simple products use AJAX only when Ajax Add to Cart setting is on.
        if (isVariable || isAjax) {
            e.preventDefault();

            var variationId = parseInt($form.find('input[name="variation_id"]').val(), 10) || 0;

            if (isVariable && variationId === 0) {
                /* translators: shown when user clicks Buy Now without selecting a variation */
                alert(CK_BUY_BUTTON.i18n_select_options);
                return;
            }

            var variation = {};
            $form.find('[name^="attribute_"]').each(function () {
                variation[$(this).attr('name')] = $(this).val();
            });

            var quantity = parseInt($form.find('input.qty').val(), 10) || 1;

            ajaxBuyNow($btn, productId, variationId, quantity, variation);
        }
        // Simple + non-AJAX: let the form submit naturally.
        // template_redirect on the server intercepts wc-quick-buy-now in POST.
    });

})(jQuery);
