<?php
namespace CommerceKit\Commerce\Features;

use CommerceKit\Commerce\Support\Base\Feature;
use CommerceKit\Commerce\Models\StockSettings;

class StockThresholdForWc extends Feature {

    protected $adjusted_cart_items  = [];
    protected $original_cart_prices = [];

    public function __construct() {
        $this->settings = StockSettings::get();

        $this->action( 'woocommerce_single_product_summary',    [ $this, 'display_stock_message' ], 25 );
        $this->action( 'woocommerce_before_calculate_totals',   [ $this, 'adjust_cart_item_prices' ], 10, 1 );
        $this->filter( 'woocommerce_product_get_price',         [ $this, 'get_adjusted_price' ], 10, 2 );
        $this->filter( 'woocommerce_variation_prices_price',    [ $this, 'adjust_variation_price_in_range' ], 10, 3 );
        $this->filter( 'woocommerce_get_variation_prices_hash', [ $this, 'add_settings_to_prices_hash' ], 10, 3 );
        $this->filter( 'woocommerce_cart_item_name',            [ $this, 'append_stock_message_to_cart_item_name' ], 10, 3 );
        $this->action( 'woocommerce_order_item_meta_start',     [ $this, 'display_checkout_stock_message' ], 10, 4 );
    }

    /**
     * Core threshold math — shared by all price-adjustment methods.
     */
    private function apply_threshold( $price, $stock_quantity ) {
        $s = $this->settings;

        if ( $stock_quantity <= $s['low_threshold'] ) {
            return $price * ( 1 + $s['low_increase'] / 100 );
        }
        if ( $stock_quantity <= $s['medium_threshold'] ) {
            return $price * ( 1 + $s['medium_increase'] / 100 );
        }
        if ( $stock_quantity >= $s['high_threshold'] ) {
            return $price * ( 1 - $s['high_decrease'] / 100 );
        }

        return $price;
    }

    /**
     * Resolve the customer-facing message for a given stock quantity.
     */
    private function get_stock_message( $stock_quantity ) {
        $s = $this->settings;

        if ( $stock_quantity <= $s['low_threshold'] ) {
            return $s['low_customer_message'] ?? '';
        }
        if ( $stock_quantity <= $s['medium_threshold'] ) {
            return $s['medium_customer_message'] ?? '';
        }
        if ( $stock_quantity >= $s['high_threshold'] ) {
            return $s['high_customer_message'] ?? '';
        }

        return '';
    }

    /**
     * Sets adjusted prices directly on cart item objects before WooCommerce sums totals.
     * Uses get_price('edit') to read the raw DB price (bypasses woocommerce_product_get_price)
     * so there is no double-adjustment when calculate_totals() later calls get_price().
     * original_cart_prices is intentionally NOT reset between calls so a second
     * woocommerce_before_calculate_totals fire in the same request always uses the
     * true pre-adjustment price.
     *
     * Action: woocommerce_before_calculate_totals
     */
    public function adjust_cart_item_prices( $cart ) {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
            return;
        }

        $this->adjusted_cart_items = [];

        foreach ( $cart->get_cart() as $cart_item ) {
            $product = $cart_item['data'];
            if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
                continue;
            }
            if ( $product->is_type( 'variable' ) ) {
                continue;
            }

            $stock_quantity = $product->get_stock_quantity();
            if ( is_null( $stock_quantity ) ) {
                continue;
            }

            $id = $product->get_id();

            // Store the raw DB price once; reuse it on every subsequent recalculation
            // so the threshold is never applied on top of an already-adjusted price.
            if ( ! isset( $this->original_cart_prices[ $id ] ) ) {
                $this->original_cart_prices[ $id ] = (float) $product->get_price( 'edit' );
            }

            $raw_price = $this->original_cart_prices[ $id ];
            if ( empty( $raw_price ) ) {
                continue;
            }

            $product->set_price( $this->apply_threshold( $raw_price, $stock_quantity ) );
            $this->adjusted_cart_items[ $id ] = true;
        }
    }

    /**
     * Adjust individual product price for the single product page.
     * Skips products already priced by adjust_cart_item_prices() so that
     * woocommerce_product_get_price never double-adjusts during calculate_totals().
     * Variable product parents are intentionally skipped — their per-variation
     * prices are handled by adjust_variation_price_in_range().
     *
     * Filter: woocommerce_product_get_price
     */
    public function get_adjusted_price( $price, $product ) {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
            return $price;
        }

        if ( empty( $price ) ) {
            return $price;
        }

        // Skip variable parents — adjust_variation_price_in_range handles them.
        if ( $product->is_type( 'variable' ) ) {
            return $price;
        }

        // Already set directly in adjust_cart_item_prices(); returning $price here
        // means calculate_totals() uses the value from set_price() as-is.
        if ( isset( $this->adjusted_cart_items[ $product->get_id() ] ) ) {
            return $price;
        }

        $stock_quantity = $product->get_stock_quantity();
        if ( is_null( $stock_quantity ) ) {
            return $price;
        }

        return $this->apply_threshold( $price, $stock_quantity );
    }

    /**
     * Adjust each variation's price inside WooCommerce's cached price-range array.
     * This drives the "£x – £y" range shown before a variation is selected.
     *
     * Filter: woocommerce_variation_prices_price
     */
    public function adjust_variation_price_in_range( $price, $variation, $product ) {
        if ( empty( $price ) ) {
            return $price;
        }

        $stock_quantity = $variation->get_stock_quantity();
        if ( is_null( $stock_quantity ) ) {
            return $price;
        }

        return $this->apply_threshold( $price, $stock_quantity );
    }

    /**
     * Bust WooCommerce's cached variation price-range transient whenever
     * threshold settings change.
     *
     * Filter: woocommerce_get_variation_prices_hash
     */
    public function add_settings_to_prices_hash( $hash, $product, $for_display ) {
        $hash[] = md5( serialize( $this->settings ) );
        return $hash;
    }

    /**
     * Show stock message on the single product page.
     * Variable products render an empty hidden placeholder filled by JS.
     *
     * Action: woocommerce_single_product_summary (priority 25)
     */
    public function display_stock_message() {
        global $product;

        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return;
        }

        if ( $this->settings['enable_message'] !== 'on' ) {
            return;
        }

        if ( $product->is_type( 'variable' ) ) {
            echo '<p class="commercekit-stock-message" style="display:none"></p>';
            return;
        }

        $stock_quantity = $product->get_stock_quantity();
        if ( is_null( $stock_quantity ) ) {
            return;
        }

        $message = $this->get_stock_message( $stock_quantity );
        if ( ! empty( $message ) ) {
            printf( '<p class="commercekit-stock-message">%s</p>', esc_html( $message ) );
        }
    }

    /**
     * Append highlighted stock message under the product name in the cart and checkout order summary.
     * Also fires during WooCommerce Blocks Store API requests (REST_REQUEST), which is how the
     * Blocks-based checkout fetches cart item names — is_checkout() returns false in that context.
     *
     * Filter: woocommerce_cart_item_name
     */
    public function append_stock_message_to_cart_item_name( $name, $cart_item, $cart_item_key ) {
        $is_store_api = defined( 'REST_REQUEST' ) && REST_REQUEST;

        if ( ! is_cart() && ! is_checkout() && ! $is_store_api ) {
            return $name;
        }

        if ( is_admin() && ! $is_store_api ) {
            return $name;
        }

        if ( $this->settings['enable_message'] !== 'on' ) {
            return $name;
        }

        $product = $cart_item['data'] ?? null;
        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return $name;
        }

        $stock_quantity = $product->get_stock_quantity();
        if ( is_null( $stock_quantity ) ) {
            return $name;
        }

        $message = $this->get_stock_message( $stock_quantity );
        if ( ! empty( $message ) ) {
            $name .= sprintf(
                '<br><span class="commercekit-stock-message">%s</span>',
                esc_html( $message )
            );
        }

        return $name;
    }

    /**
     * Show stock message on the Thank You / Order detail page.
     *
     * Action: woocommerce_order_item_meta_start
     */
    public function display_checkout_stock_message( $item_id, $item, $order, $plain_text ) {
        if ( in_array( $order->get_status(), [ 'cancelled', 'failed' ], true ) ) {
            return;
        }

        if ( ! $item || ! is_a( $item, 'WC_Order_Item_Product' ) ) {
            return;
        }

        if ( $this->settings['enable_message'] !== 'on' ) {
            return;
        }

        $product = $item->get_product();
        if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
            return;
        }

        $stock_quantity = $product->get_stock_quantity();
        if ( is_null( $stock_quantity ) ) {
            return;
        }

        $message = $this->get_stock_message( $stock_quantity );
        if ( ! empty( $message ) ) {
            printf(
                '<span class="commercekit-stock-message" style="display:block;margin-top:5px;">%s</span>',
                esc_html( $message )
            );
        }
    }
}
