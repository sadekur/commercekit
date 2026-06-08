<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

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

/**
 * Check if current page is cart or checkout and uses WC Blocks.
 */
if ( ! function_exists( 'commercekit_is_blocks_page' ) ) :
    function commercekit_is_blocks_page(): bool {
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
endif;
