<?php
namespace CommerceKit\Commerce\Features;

use CommerceKit\Commerce\Classes\Trait\Hookable;

class BuyButtonForWoocommerce {
    use Hookable;

    protected $settings = [];

    public function __construct() {
        $this->settings = commercekit_get_buy_button_settings();

        // single product page form submit + archive link
        $this->action( 'template_redirect', [ $this, 'buy_now_button_submit' ] );

        // variable products always, simple products when Ajax is on
        $this->action( 'wp_ajax_ck_buy_button_add_to_cart',        [ $this, 'ajax_add_to_cart' ] );
        $this->action( 'wp_ajax_nopriv_ck_buy_button_add_to_cart', [ $this, 'ajax_add_to_cart' ] );

        if ( $this->settings['button_style'] === 'custom' ) {
            $this->action( 'wp_enqueue_scripts', [ $this, 'output_custom_css' ] );
        }

        if ( $this->settings['hide_add_to_cart'] === 'yes' ) {
            $this->action( 'wp_enqueue_scripts', [ $this, 'output_hide_add_to_cart_css' ] );
        }

        if ( $this->settings['enable_single'] === 'yes' ) {
            $hook = $this->settings['button_position_single'] === 'after_add_to_cart'
                ? 'woocommerce_after_add_to_cart_button'
                : 'woocommerce_before_add_to_cart_button';
            $this->action( $hook, [ $this, 'buy_now_button_single' ] );
        }

        if ( $this->settings['enable_archive'] === 'yes' ) {
            $priority = $this->settings['button_position_archive'] === 'after_add_to_cart' ? 11 : 9;
            $this->action( 'woocommerce_after_shop_loop_item', [ $this, 'buy_now_button_archive' ], $priority );
        }

        // Backward-compatible shortcode
        $this->add_shortcode( 'buy_button', [ $this, 'shortcode_buy_button' ] );
    }

    public function output_hide_add_to_cart_css() {
        wp_add_inline_style( 'woocommerce-inline', '.single_add_to_cart_button,.add_to_cart_button{display:none!important;}' );
    }

    public function output_custom_css() {
        $s   = $this->settings;
        $css = '.wc-buy-now-btn{';

        if ( ! empty( $s['button_text_color'] ) ) {
            $css .= 'color:' . sanitize_hex_color( $s['button_text_color'] ) . '!important;';
        }
        if ( ! empty( $s['button_background_color'] ) ) {
            $css .= 'background-color:' . sanitize_hex_color( $s['button_background_color'] ) . '!important;';
        }
        if ( ! empty( $s['button_border_color'] ) ) {
            $css .= 'border-color:' . sanitize_hex_color( $s['button_border_color'] ) . '!important;';
        }
        if ( ! empty( $s['button_border_size'] ) ) {
            $css .= 'border-width:' . absint( $s['button_border_size'] ) . 'px!important;border-style:solid;';
        }
        if ( ! empty( $s['button_border_radius'] ) ) {
            $css .= 'border-radius:' . absint( $s['button_border_radius'] ) . 'px!important;';
        }
        if ( ! empty( $s['button_font_size'] ) ) {
            $css .= 'font-size:' . absint( $s['button_font_size'] ) . 'px!important;';
        }

        foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
            $val = $s['button_margin'][ $side ] ?? '';
            if ( $val !== '' ) {
                $css .= 'margin-' . $side . ':' . absint( $val ) . 'px!important;';
            }
        }
        foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
            $val = $s['button_padding'][ $side ] ?? '';
            if ( $val !== '' ) {
                $css .= 'padding-' . $side . ':' . absint( $val ) . 'px!important;';
            }
        }

        $css .= '}';
        wp_add_inline_style( 'woocommerce-inline', $css );
    }

    /**
     * Button markup on the single product page.
     * Placed inside WooCommerce's <form class="cart">, so the form POST carries
     * variation_id and attribute_* selections automatically for variable products.
     */
    public function buy_now_button_single() {
        global $product;

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return;
        }

        $product_id   = $product->get_id();
        $button_text  = $this->settings['button_text'] ?: 'Buy Now';
        $redirect     = $this->settings['redirect_location'];
        $product_type = $product->get_type();

        printf(
            '<button type="button" class="button alt wc-buy-now-btn wc-buy-now-btn-single" data-product-id="%d" data-redirect-location="%s" data-product-type="%s">%s</button>',
            $product_id,
            esc_attr( $redirect ),
            esc_attr( $product_type ),
            esc_html( $button_text )
        );
    }

    /**
     * Button markup on the shop/archive page.
     * Variable products link to the product page (variation must be selected there).
     * Simple products get a direct add-to-cart link handled by template_redirect.
     */
    public function buy_now_button_archive() {
        global $product;

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return;
        }

        if ( ! $product->is_purchasable() || ! $product->is_in_stock() ) {
            return;
        }

        $button_text = $this->settings['button_text'] ?: 'Buy Now';
        $product_id  = $product->get_id();

        // Variable: send user to product page to select a variation
        if ( $product->is_type( 'variable' ) ) {
            printf(
                '<a href="%s" class="button wc-buy-now-btn wc-buy-now-btn-archive" data-product_type="variable">%s</a>',
                esc_url( get_permalink( $product_id ) ),
                esc_html( $button_text )
            );
            return;
        }

        $quantity = max( 1, absint( $this->settings['default_shop_quantity'] ) );

        if ( $product->get_manage_stock() ) {
            $stock = $product->get_stock_quantity();
            if ( $stock !== null && $stock < $quantity && ! $product->backorders_allowed() ) {
                $quantity = max( 1, $stock );
            }
        }

        $redirect_url = add_query_arg( [
            'wc-quick-buy-now' => $product_id,
            'quantity'         => $quantity,
        ], commercekit_buy_button_redirect_location( $product_id, $this->settings ) );

        printf(
            '<a href="%s" class="button wc-buy-now-btn wc-buy-now-btn-archive" data-product_id="%d" data-quantity="%d" data-wc-buy-now="true" data-product_type="simple">%s</a>',
            esc_url( $redirect_url ),
            $product_id,
            $quantity,
            esc_html( $button_text )
        );
    }

    /**
     * Handles non-AJAX Buy Now clicks.
     * Covers both the single product page form submit (POST) and the archive link (GET).
     */
    public function buy_now_button_submit() {
        if ( ! isset( $_REQUEST['wc-quick-buy-now'] ) ) {
            return;
        }

        $product_id   = absint( $_REQUEST['wc-quick-buy-now'] );
        $quantity     = isset( $_REQUEST['quantity'] ) ? max( 1, absint( $_REQUEST['quantity'] ) ) : 1;
        $variation_id = isset( $_REQUEST['variation_id'] ) ? absint( $_REQUEST['variation_id'] ) : 0;
        $variation    = [];

        if ( ! $product_id ) {
            return;
        }

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return;
        }

        if ( $this->settings['reset_cart'] === 'yes' ) {
            WC()->cart->empty_cart();
        }

        if ( $variation_id && $product->is_type( 'variable' ) ) {
            foreach ( $_REQUEST as $key => $value ) {
                if ( strpos( $key, 'attribute_' ) === 0 ) {
                    $variation[ sanitize_text_field( $key ) ] = sanitize_text_field( $value );
                }
            }
            if ( ! commercekit_is_product_in_cart( $product_id, $variation_id ) ) {
                WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation );
            }
        } else {
            if ( ! ( $product->is_sold_individually() && commercekit_is_product_in_cart( $product_id ) ) ) {
                WC()->cart->add_to_cart( $product_id, $quantity );
            }
        }

        wp_safe_redirect( commercekit_buy_button_redirect_location( $product_id, $this->settings ) );
        exit;
    }

    /**
     * AJAX handler. Used for variable products (always) and simple products when
     * Ajax Add to Cart is enabled.
     */
    public function ajax_add_to_cart() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'ck_buy_button_nonce' ) ) {
            wp_send_json_error( [ 'message' => __( 'Security check failed.', 'commerce-kit' ) ], 403 );
        }

        $product_id   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
        $variation_id = isset( $_POST['variation_id'] ) ? absint( $_POST['variation_id'] ) : 0;
        $quantity     = isset( $_POST['quantity'] ) ? max( 1, absint( $_POST['quantity'] ) ) : 1;
        $variation    = [];

        if ( ! $product_id ) {
            wp_send_json_error( [ 'message' => __( 'Invalid product.', 'commerce-kit' ) ] );
        }

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            wp_send_json_error( [ 'message' => __( 'Product not found.', 'commerce-kit' ) ] );
        }

        if ( $this->settings['reset_cart'] === 'yes' ) {
            WC()->cart->empty_cart();
        }

        $added = false;

        if ( $variation_id && $product->is_type( 'variable' ) ) {
            if ( isset( $_POST['variation'] ) && is_array( $_POST['variation'] ) ) {
                foreach ( $_POST['variation'] as $name => $value ) {
                    if ( strpos( $name, 'attribute_' ) === 0 ) {
                        $variation[ sanitize_text_field( $name ) ] = sanitize_text_field( $value );
                    }
                }
            }
            if ( ! commercekit_is_product_in_cart( $product_id, $variation_id ) ) {
                WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation );
            }
            $added = true;
        } elseif ( $product->is_type( 'simple' ) ) {
            if ( ! ( $product->is_sold_individually() && commercekit_is_product_in_cart( $product_id ) ) ) {
                WC()->cart->add_to_cart( $product_id, $quantity );
            }
            $added = true;
        }

        if ( $added ) {
            wp_send_json_success( [
                'redirect_url' => commercekit_buy_button_redirect_location( $product_id, $this->settings ),
            ] );
        } else {
            wp_send_json_error( [ 'message' => __( 'Failed to add product to cart.', 'commerce-kit' ) ] );
        }
    }

    // Backward-compatible shortcode [buy_button id="123"]
    public function shortcode_buy_button( $atts ) {
        if ( empty( $atts['id'] ) ) {
            return __( 'You need to provide a valid product ID in the shortcode', 'commerce-kit' );
        }
        $atts        = array_map( 'sanitize_text_field', $atts );
        $button_text = ! empty( $atts['button_text'] ) ? $atts['button_text'] : ( $this->settings['button_text'] ?: 'Buy Now' );
        $class       = 'woocommerce' . ( ! empty( $atts['class'] ) ? ' ' . $atts['class'] : '' );

        $url = add_query_arg( [
            'add-to-cart'      => $atts['id'],
            'wc-quick-buy-now' => $atts['id'],
        ] );

        return sprintf(
            '<div class="%s"><a href="%s" class="button wc-buy-now-btn" rel="nofollow">%s</a></div>',
            esc_attr( $class ),
            esc_url( $url ),
            esc_html( $button_text )
        );
    }
}
