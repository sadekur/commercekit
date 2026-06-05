<?php
// Exit if accessed directly
if ( !defined('ABSPATH' ) ) {
	exit;
}
/**
 * Function to set up the database table for CommerceKit
 */
if( ! function_exists( 'commercekit_get_stock_settings' ) ) :
	function commercekit_get_stock_settings() {
        $defaults = [
            'low_threshold'    => 5,
            'low_increase'     => 40,
            'medium_threshold' => 20,
            'medium_increase'  => 20,
            'high_threshold'   => 100,
            'high_decrease'   => 15,
            'enable_message'  => 'off',
            'low_customer_message'    => 'Low stock - high demand item',
            'medium_customer_message' => 'Medium stock - price adjusted',
            'high_customer_message'   => 'High stock - clearance price',
        ];

        $saved = get_option( 'commerce_kit_stock_threshold', [] );
        return array_merge( $defaults, $saved );
    }
endif;


if ( ! function_exists( 'commercekit_get_buy_button_settings' ) ) :
    function commercekit_get_buy_button_settings() {
        $defaults = [
            'enable_single'           => 'yes',
            'enable_archive'          => 'yes',
            'button_position_single'  => 'after_add_to_cart',
            'button_position_archive' => 'after_add_to_cart',
            'redirect_location'       => 'checkout',
            'custom_redirect_url'     => '',
            'button_text'             => 'Buy Now',
            'default_shop_quantity'   => 1,
            'reset_cart'              => 'no',
            'ajax_add_to_cart'        => 'no',
            'hide_add_to_cart'        => 'no',
            'button_style'            => 'default',
            'button_text_color'       => '',
            'button_background_color' => '',
            'button_border_color'     => '',
            'button_border_size'      => '',
            'button_border_radius'    => '',
            'button_font_size'        => '',
            'button_margin'           => [ 'top' => '', 'right' => '', 'bottom' => '', 'left' => '' ],
            'button_padding'          => [ 'top' => '', 'right' => '', 'bottom' => '', 'left' => '' ],
        ];

        $saved    = get_option( 'commerce_kit_buy_button_settings', [] );
        $settings = array_merge( $defaults, $saved );
        
        foreach ( [ 'button_margin', 'button_padding' ] as $key ) {
            if ( isset( $saved[ $key ] ) && is_array( $saved[ $key ] ) ) {
                $settings[ $key ] = array_merge( $defaults[ $key ], $saved[ $key ] );
            }
        }

        return $settings;
    }
endif;


    /**
     * Get active blocks.
     *
     * @return array List of active blocks.
     */
	if( ! function_exists( 'commerce_kit_get_active_blocks' ) ) :
    function commerce_kit_get_active_blocks() {
        $blocks_dir     = COMMERCE_KIT_PATH . 'blocks/';
        $categories     = glob( $blocks_dir );
        $block_settings = get_option('commerce_kit_block_settings');
        $block_settings = maybe_unserialize($block_settings);

        $active_blocks = [];

        foreach ( $categories as $category ) {
            $blocks = glob( rtrim( $category, '/' ) . '/*', GLOB_ONLYDIR );

            foreach ( $blocks as $block ) {
                $block_name = basename( $block );
                $block_option_key = "{$block_name}";

                if ( isset( $block_settings[$block_option_key] ) && $block_settings[$block_option_key] === 'on' ) {
                    $active_blocks[] = $block_name;
                }
            }
        }

        return $active_blocks;
    }
endif;

if ( ! function_exists( 'commercekit_buy_button_redirect_location' ) ) :
    function commercekit_buy_button_redirect_location( $product_id, array $settings ) {
        $location   = $settings['redirect_location']   ?? 'checkout';
        $custom_url = $settings['custom_redirect_url'] ?? '';

        switch ( $location ) {
            case 'cart':
                return wc_get_cart_url();
            case 'custom':
                return ! empty( $custom_url ) ? esc_url_raw( $custom_url ) : wc_get_checkout_url();
            default:
                return wc_get_checkout_url();
        }
    }
endif;

if ( ! function_exists( 'commercekit_is_product_in_cart' ) ) :
    function commercekit_is_product_in_cart( $product_id, $variation_id = 0 ) {
        foreach ( WC()->cart->get_cart() as $item ) {
            if ( $variation_id ) {
                if ( (int) $item['product_id'] === $product_id && (int) $item['variation_id'] === $variation_id ) {
                    return true;
                }
            } else {
                if ( (int) $item['product_id'] === $product_id ) {
                    return true;
                }
            }
        }
        return false;
    }
endif;

if ( ! function_exists( 'commercekit_get_load_tip_settings' ) ) :
    function commercekit_get_load_settings() {
        $defaults = [
            'load_css' => 'yes',
            'load_js' => 'yes'
        ];
        $saved = get_option( 'commerce_kit_load_settings', [] );
        return array_merge( $defaults, $saved );
    }
endif;