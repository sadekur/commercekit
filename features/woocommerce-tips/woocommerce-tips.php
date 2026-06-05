<?php
namespace CommerceKit\Commerce\Features;

use CommerceKit\Commerce\Classes\Trait\Hookable;

class WoocommerceTips {
    use Hookable;

    private array $settings;

    public function __construct() {
        $this->settings = commercekit_get_load_tip_settings();

        if ( $this->settings['tcwt_cart'] === 'on' ) {
            // Classic cart template hook (fires when theme uses woocommerce/cart.php shortcode)
            $this->action( 'woocommerce_after_cart_table', [ $this, 'render_tip_form' ] );

            // WooCommerce Blocks cart: filter fires on block render, we prepend before the block
            // so the form sits outside React's root and won't be wiped during hydration.
            $this->filter( 'render_block_woocommerce/cart', [ $this, 'inject_for_blocks_cart' ] );

            $this->filter( 'woocommerce_add_to_cart_fragments', [ $this, 'cart_fragments' ] );
        }

        if ( $this->settings['tcwt_checkout'] === 'on' ) {
            // Classic checkout template hook
            $this->action( 'woocommerce_review_order_before_payment', [ $this, 'render_tip_form' ] );

            // WooCommerce Blocks checkout: inject before the checkout block
            $this->filter( 'render_block_woocommerce/checkout', [ $this, 'inject_for_blocks_checkout' ] );
        }

        $this->action( 'woocommerce_cart_calculate_fees',    [ $this, 'add_tip_fee'       ] );
        $this->action( 'woocommerce_checkout_order_created', [ $this, 'save_tip_to_order' ] );

        if ( $this->settings['tcwt_clear'] === 'yes' ) {
            $this->action( 'woocommerce_thankyou', [ $this, 'clear_tip' ] );
        }

        $this->action( 'wp_ajax_ck_set_tip',           [ $this, 'ajax_set_tip'    ] );
        $this->action( 'wp_ajax_nopriv_ck_set_tip',    [ $this, 'ajax_set_tip'    ] );
        $this->action( 'wp_ajax_ck_remove_tip',        [ $this, 'ajax_remove_tip' ] );
        $this->action( 'wp_ajax_nopriv_ck_remove_tip', [ $this, 'ajax_remove_tip' ] );

        $this->action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    public function enqueue_assets(): void {
        if ( ! is_cart() && ! is_checkout() ) {
            return;
        }

        wp_enqueue_style(
            'ck-tips-style',
            COMMERCE_KIT_URL . 'features/woocommerce-tips/tips.css',
            [],
            filemtime( COMMERCE_KIT_PATH . 'features/woocommerce-tips/tips.css' )
        );

        wp_enqueue_script(
            'ck-tips-script',
            COMMERCE_KIT_URL . 'features/woocommerce-tips/tips.js',
            [ 'jquery' ],
            filemtime( COMMERCE_KIT_PATH . 'features/woocommerce-tips/tips.js' ),
            true
        );

        wp_localize_script( 'ck-tips-script', 'CK_TIPS', [
            'ajaxurl'   => admin_url( 'admin-ajax.php' ),
            'nonce'     => wp_create_nonce( 'ck_tips_nonce' ),
            'is_blocks' => $this->is_blocks_page(),
        ] );
    }

    private function is_blocks_page(): bool {
        $page_id = 0;
        if ( is_cart() ) {
            $page_id = wc_get_page_id( 'cart' );
        } elseif ( is_checkout() ) {
            $page_id = wc_get_page_id( 'checkout' );
        }
        if ( ! $page_id ) {
            return false;
        }
        $post = get_post( $page_id );
        return $post && (
            has_block( 'woocommerce/cart',     $post ) ||
            has_block( 'woocommerce/checkout', $post )
        );
    }

    public function render_tip_form(): void {
        $s       = $this->settings;
        $rates   = array_filter( array_map( 'trim', explode( ',', $s['tcwt_rates'] ) ) );
        $session = WC()->session ? WC()->session->get( 'ck_tip', [] ) : [];

        $active_rate = $session['rate'] ?? null;
        $active_type = $session['type'] ?? null;
        $has_tip     = ! empty( $session );
        ?>
        <div class="ck-tips-wrapper">
            <?php if ( $s['tcwt_title'] ) : ?>
                <h3 class="ck-tips-title"><?php echo esc_html( $s['tcwt_title'] ); ?></h3>
            <?php endif; ?>

            <div class="ck-tips-buttons">

                <?php foreach ( $rates as $rate ) :
                    $is_active = ( $active_type === $s['tcwt_type'] && (string) $active_rate === (string) $rate );
                    $label     = ( $s['tcwt_type'] === 'percent' )
                        ? $rate . '%'
                        : wp_strip_all_tags( wc_price( (float) $rate ) );
                    ?>
                    <button type="button"
                        class="ck-tip-btn<?php echo $is_active ? ' ck-tip-active' : ''; ?>"
                        data-rate="<?php echo esc_attr( $rate ); ?>"
                        data-type="<?php echo esc_attr( $s['tcwt_type'] ); ?>">
                        <?php echo esc_html( $label ); ?>
                    </button>
                <?php endforeach; ?>

                <?php if ( $s['tcwt_cash'] === 'yes' ) :
                    $cash_active = ( $active_type === 'cash' );
                    ?>
                    <button type="button"
                        class="ck-tip-btn<?php echo $cash_active ? ' ck-tip-active' : ''; ?>"
                        data-rate="0"
                        data-type="cash">
                        <?php esc_html_e( 'Cash', 'commerce-kit' ); ?>
                    </button>
                <?php endif; ?>

                <?php if ( $s['tcwt_custom'] === 'yes' ) :
                    $custom_active = ( $active_type === 'custom' );
                    $custom_label  = $custom_active
                        ? sprintf(
                            /* translators: %s = currency amount */
                            __( 'Custom Tip (%s)', 'commerce-kit' ),
                            wp_strip_all_tags( wc_price( (float) ( $session['amount'] ?? 0 ) ) )
                          )
                        : __( 'Custom Tip', 'commerce-kit' );
                    ?>
                    <button type="button"
                        class="ck-tip-btn ck-tip-custom-trigger<?php echo $custom_active ? ' ck-tip-active' : ''; ?>"
                        data-type="custom">
                        <?php echo esc_html( $custom_label ); ?>
                    </button>
                <?php endif; ?>

            </div>

            <?php if ( $s['tcwt_custom'] === 'yes' ) : ?>
                <div class="ck-custom-tip-row" style="display:none;">
                    <input type="number"
                        class="ck-custom-tip-input"
                        min="0.01"
                        step="0.01"
                        placeholder="<?php esc_attr_e( 'Enter amount', 'commerce-kit' ); ?>" />
                    <button type="button" class="ck-apply-custom">
                        <?php esc_html_e( 'Apply', 'commerce-kit' ); ?>
                    </button>
                </div>
            <?php endif; ?>

            <?php if ( $has_tip ) : ?>
                <button type="button" class="ck-remove-tip">
                    <?php esc_html_e( 'Remove Tip', 'commerce-kit' ); ?>
                </button>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * WC Blocks cart: prepend tip form BEFORE the block's outer <div>.
     * Placing it before the React root means React hydration cannot wipe it.
     * The form appears above the cart items on Blocks pages.
     *
     * On classic cart pages this filter never fires (no woocommerce/cart block).
     */
    public function inject_for_blocks_cart( string $content ): string {
        ob_start();
        $this->render_tip_form();
        return ob_get_clean() . $content;
    }

    /**
     * WC Blocks checkout: try to insert the form before the payment block so it
     * appears above the payment section. Falls back to prepending before the whole block.
     *
     * On classic checkout pages this filter never fires.
     */
    public function inject_for_blocks_checkout( string $content ): string {
        ob_start();
        $this->render_tip_form();
        $form = ob_get_clean();

        // Insert directly before the payment inner block using its data attribute,
        // which is stable across WC Blocks versions.
        $marker = 'data-block-name="woocommerce/checkout-payment-block"';
        if ( strpos( $content, $marker ) !== false ) {
            return str_replace( '<div ' . $marker, $form . '<div ' . $marker, $content );
        }

        // Fallback: prepend before the entire checkout block
        return $form . $content;
    }

    /**
     * Classic cart: register tip form and totals as WC fragments so selecting a
     * tip updates the page without a reload.
     * Not used on Blocks pages (Blocks uses its own Store API for cart state).
     */
    public function cart_fragments( array $fragments ): array {
        ob_start();
        $this->render_tip_form();
        $fragments['.ck-tips-wrapper'] = ob_get_clean();

        ob_start();
        woocommerce_cart_totals();
        $fragments['.cart_totals'] = ob_get_clean();

        return $fragments;
    }

    public function add_tip_fee( \WC_Cart $cart ): void {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
            return;
        }

        $tip = WC()->session ? WC()->session->get( 'ck_tip', [] ) : [];

        if ( empty( $tip ) || ! isset( $tip['type'] ) ) {
            return;
        }

        if ( $tip['type'] === 'cash' ) {
            return;
        }

        // Recalculate percent tips live so they stay accurate when cart items change.
        if ( $tip['type'] === 'percent' && isset( $tip['rate'] ) ) {
            $amount = round( ( $cart->get_subtotal() * (float) $tip['rate'] ) / 100, wc_get_price_decimals() );
        } else {
            $amount = floatval( $tip['amount'] ?? 0 );
        }

        if ( $amount <= 0 ) {
            return;
        }

        $taxable = ( $this->settings['tcwt_taxable'] === 'on' );
        $label   = $tip['label'] ?? __( 'Tip', 'commerce-kit' );

        $cart->add_fee( $label, $amount, $taxable );
    }

    public function ajax_set_tip(): void {
        check_ajax_referer( 'ck_tips_nonce', 'nonce' );

        $type   = sanitize_text_field( $_POST['type']   ?? '' );
        $rate   = abs( floatval( $_POST['rate']   ?? 0 ) );
        $amount = abs( floatval( $_POST['amount'] ?? 0 ) );

        if ( $type === 'cash' ) {

            $tip = [
                'type'   => 'cash',
                'rate'   => 0,
                'amount' => 0,
                'label'  => __( 'Tip (Cash)', 'commerce-kit' ),
            ];

        } elseif ( $type === 'custom' ) {

            if ( $amount <= 0 ) {
                wp_send_json_error( [ 'message' => __( 'Invalid amount.', 'commerce-kit' ) ] );
            }
            $tip = [
                'type'   => 'custom',
                'rate'   => $amount,
                'amount' => $amount,
                'label'  => __( 'Tip (Custom Tip)', 'commerce-kit' ),
            ];

        } elseif ( $type === 'percent' ) {

            if ( $rate <= 0 ) {
                wp_send_json_error();
            }
            $subtotal = WC()->cart->get_subtotal();
            $calc     = round( ( $subtotal * $rate ) / 100, wc_get_price_decimals() );
            $tip = [
                'type'   => 'percent',
                'rate'   => $rate,
                'amount' => $calc,
                /* translators: %s = percent number */
                'label'  => sprintf( __( 'Tip (%s%%)', 'commerce-kit' ), $rate ),
            ];

        } elseif ( $type === 'fixed' ) {

            if ( $rate <= 0 ) {
                wp_send_json_error();
            }
            $tip = [
                'type'   => 'fixed',
                'rate'   => $rate,
                'amount' => $rate,
                /* translators: %s = currency amount */
                'label'  => sprintf( __( 'Tip (%s)', 'commerce-kit' ), wp_strip_all_tags( wc_price( $rate ) ) ),
            ];

        } else {
            wp_send_json_error( [ 'message' => 'Unknown tip type.' ] );
        }

        WC()->session->set( 'ck_tip', $tip );
        WC()->cart->calculate_totals();

        wp_send_json_success( [ 'tip' => $tip ] );
    }

    public function ajax_remove_tip(): void {
        check_ajax_referer( 'ck_tips_nonce', 'nonce' );

        WC()->session->set( 'ck_tip', [] );
        WC()->cart->calculate_totals();

        wp_send_json_success();
    }

    public function save_tip_to_order( \WC_Order $order ): void {
        $tip = WC()->session ? WC()->session->get( 'ck_tip', [] ) : [];
        if ( ! empty( $tip ) ) {
            $order->update_meta_data( '_ck_tip', $tip );
            $order->save();
        }
    }

    public function clear_tip(): void {
        if ( WC()->session ) {
            WC()->session->set( 'ck_tip', [] );
        }
    }
}
