(function ($) {
    'use strict';

    var isCheckout = $('body').hasClass('woocommerce-checkout');
    // COMMERCEKIT.is_blocks is set by PHP: true when cart/checkout page uses WC Blocks.
    var isBlocks   = (typeof COMMERCEKIT !== 'undefined' && COMMERCEKIT.is_blocks);

    function setTip(data) {
        $.post(COMMERCEKIT.ajaxurl, {
            action: 'ck_set_tip',
            nonce:  COMMERCEKIT.tips_nonce,
            type:   data.type,
            rate:   data.rate   || 0,
            amount: data.amount || 0,
        }).done(function (res) {
            if (res.success) { refreshTotals(); }
        });
    }

    function removeTip() {
        $.post(COMMERCEKIT.ajaxurl, {
            action: 'ck_remove_tip',
            nonce:  COMMERCEKIT.tips_nonce,
        }).done(function (res) {
            if (res.success) { refreshTotals(); }
        });
    }

    function refreshTotals() {
        if (isBlocks) {
            window.location.reload();
            return;
        }

        if (isCheckout) {
            $(document.body).trigger('update_checkout');
        } else {
            $(document.body).trigger('wc_fragment_refresh');
        }
    }

    // ── Event handlers (delegated so they survive fragment/reload DOM changes) ─

    $(document).on('click', '.ck-tip-btn:not(.ck-tip-custom-trigger)', function () {
        setTip({
            type: $(this).data('type'),
            rate: $(this).data('rate'),
        });
    });

    $(document).on('click', '.ck-tip-custom-trigger', function () {
        $('.ck-custom-tip-row').slideToggle(150);
    });

    $(document).on('click', '.ck-apply-custom', function () {
        var amount = parseFloat($('.ck-custom-tip-input').val());
        if (!amount || amount <= 0) { return; }
        setTip({ type: 'custom', amount: amount });
        $('.ck-custom-tip-row').slideUp(150);
    });

    $(document).on('click', '.ck-remove-tip', function () {
        removeTip();
    });

})(jQuery);
