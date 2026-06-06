(function ($) {
    'use strict';

    var isCheckout = $('body').hasClass('woocommerce-checkout');
    var isBlocks   = !!(typeof COMMERCEKIT !== 'undefined' && COMMERCEKIT.is_blocks);

    function setTip(data) {
        $.post(COMMERCEKIT.ajaxurl, {
            action: 'ck_set_tip',
            nonce:  COMMERCEKIT.tips_nonce,
            type:   data.type,
            rate:   data.rate   || 0,
            amount: data.amount || 0,
        }).done(function (res) {
            if (res.success && res.data && res.data.tip) {
                updateActiveState(res.data.tip);
                refreshTotals();
            }
        });
    }

    function removeTip() {
        $.post(COMMERCEKIT.ajaxurl, {
            action: 'ck_remove_tip',
            nonce:  COMMERCEKIT.tips_nonce,
        }).done(function (res) {
            if (res.success) {
                clearActiveState();
                refreshTotals();
            }
        });
    }

    // ── UI state (used on Blocks pages and as an immediate visual for classic) ─

    function updateActiveState(tip) {
        var $wrapper = $('.ck-tips-wrapper');

        $wrapper.find('.ck-tip-btn').removeClass('ck-tip-active');

        if (tip.type === 'custom') {
            var symbol = (COMMERCEKIT.currency_symbol || '');
            $wrapper.find('.ck-tip-custom-trigger')
                .addClass('ck-tip-active')
                .text('Custom Tip (' + symbol + parseFloat(tip.amount).toFixed(2) + ')');
        } else if (tip.type === 'cash') {
            $wrapper.find('.ck-tip-btn[data-type="cash"]').addClass('ck-tip-active');
        } else {
            $wrapper.find(
                '.ck-tip-btn[data-rate="' + tip.rate + '"][data-type="' + tip.type + '"]'
            ).addClass('ck-tip-active');
        }

        // Ensure Remove Tip button is visible
        var $remove = $wrapper.find('.ck-remove-tip');
        if ($remove.length) {
            $remove.show();
        } else {
            $wrapper.append(
                '<button type="button" class="ck-remove-tip">Remove Tip</button>'
            );
        }
    }

    function clearActiveState() {
        $('.ck-tip-btn').removeClass('ck-tip-active');
        // Reset custom button label
        $('.ck-tip-custom-trigger').text('Custom Tip');
        $('.ck-remove-tip').hide();
    }

    // ── Totals refresh

    function refreshTotals() {
        if (isBlocks) {
            refreshBlocksTotals();
            return;
        }
        // Classic cart: fragment refresh re-renders .ck-tips-wrapper + .cart_totals
        // Classic checkout: update_checkout re-renders the order review section
        if (isCheckout) {
            $(document.body).trigger('update_checkout');
        } else {
            $(document.body).trigger('wc_fragment_refresh');
        }
    }

    function refreshBlocksTotals() {
        // WC Blocks manages cart state via @wordpress/data ('wc/store/cart' store).
        // Invalidating the cart data resolution causes WC Blocks to re-fetch from
        // /wc/store/v1/cart, which runs calculate_totals() server-side — our fee
        // appears in the totals without any page reload.
        if (window.wp && window.wp.data) {
            try {
                window.wp.data
                    .dispatch('wc/store/cart')
                    .invalidateResolutionForStoreSelector('getCartData');
                return;
            } catch (e) {
                // wp.data or the method not available — fall through to reload
            }
        }
        window.location.reload();
    }

    // ── Event handlers (delegated — survive fragment/DOM updates) ────────────

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
