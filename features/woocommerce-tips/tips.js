(function ($) {
    'use strict';

    var isCheckout = $('body').hasClass('woocommerce-checkout');

    // ── AJAX helpers ─────────────────────────────────────────────────────────

    function setTip(data) {
        $.post(CK_TIPS.ajaxurl, {
            action: 'ck_set_tip',
            nonce:  CK_TIPS.nonce,
            type:   data.type,
            rate:   data.rate   || 0,
            amount: data.amount || 0,
        }).done(function (res) {
            if (res.success) { refreshTotals(); }
        });
    }

    function removeTip() {
        $.post(CK_TIPS.ajaxurl, {
            action: 'ck_remove_tip',
            nonce:  CK_TIPS.nonce,
        }).done(function (res) {
            if (res.success) { refreshTotals(); }
        });
    }

    // On cart: wc_fragment_refresh updates both .ck-tips-wrapper and .cart_totals
    // (registered via woocommerce_add_to_cart_fragments in the PHP class).
    // On checkout: update_checkout re-renders the full order review section.
    function refreshTotals() {
        if (isCheckout) {
            $(document.body).trigger('update_checkout');
        } else {
            $(document.body).trigger('wc_fragment_refresh');
        }
    }

    // ── Event handlers (delegated for post-fragment-refresh DOM) ─────────────

    // Preset rate buttons (percent / fixed / cash)
    $(document).on('click', '.ck-tip-btn:not(.ck-tip-custom-trigger)', function () {
        setTip({
            type: $(this).data('type'),
            rate: $(this).data('rate'),
        });
    });

    // Custom tip button — toggle the input row
    $(document).on('click', '.ck-tip-custom-trigger', function () {
        $('.ck-custom-tip-row').slideToggle(150);
    });

    // Apply custom tip amount
    $(document).on('click', '.ck-apply-custom', function () {
        var amount = parseFloat($('.ck-custom-tip-input').val());
        if (!amount || amount <= 0) { return; }
        setTip({ type: 'custom', amount: amount });
        $('.ck-custom-tip-row').slideUp(150);
    });

    // Remove tip
    $(document).on('click', '.ck-remove-tip', function () {
        removeTip();
    });

})(jQuery);
