<?php
namespace CommerceKit\Commerce\API;

use CommerceKit\Commerce\Models\StockSettings;

class Stock_Threshold {

    public function save_stock_threshold( $request ) {

        $params = $request->get_json_params();

        $data = [
            'low_threshold'           => intval( $params['low_threshold'] ?? 5 ),
            'low_increase'            => floatval( $params['low_increase'] ?? 40 ),

            'medium_threshold'        => intval( $params['medium_threshold'] ?? 20 ),
            'medium_increase'         => floatval( $params['medium_increase'] ?? 20 ),

            'high_threshold'          => intval( $params['high_threshold'] ?? 100 ),
            'high_decrease'           => floatval( $params['high_decrease'] ?? 15 ),

            'enable_message'          => ( $params['enable_message'] ?? 'off' ) === 'on' ? 'on' : 'off',
            'low_customer_message'    => sanitize_text_field( $params['low_customer_message'] ?? 'Low stock - high demand item' ),
            'medium_customer_message' => sanitize_text_field( $params['medium_customer_message'] ?? 'Medium stock - price adjusted' ),
            'high_customer_message'   => sanitize_text_field( $params['high_customer_message'] ?? 'High stock - clearance price' ),
        ];

        update_option( 'commerce_kit_stock_threshold', $data );

        return rest_ensure_response([
            'success' => true,
            'message' => 'Stock settings saved successfully.',
        ]);
    }

    public function get_stock_threshold() {

        $defaults = [
            'low_threshold'             => 5,
            'low_increase'              => 40,

            'medium_threshold'          => 20,
            'medium_increase'           => 20,

            'high_threshold'            => 100,
            'high_decrease'             => 15,

            'enable_message'            => 'off',
            'low_customer_message'      => 'Low stock - high demand item',
            'medium_customer_message'   => 'Medium stock - price adjusted',
            'high_customer_message'     => 'High stock - clearance price',
        ];

        $data = get_option( 'commerce_kit_stock_threshold', [] );

        return rest_ensure_response( array_merge( $defaults, $data ) );
    }

    public function stock_threshold_permission( $request ) {
        return current_user_can( 'manage_options' );
    }

    public function get_variation_stock( $request ) {
        $variation_id = absint( $request->get_param( 'variation_id' ) );

        if ( ! $variation_id ) {
            return rest_ensure_response([
                'message' => '',
            ]);
        }

        $variation = wc_get_product( $variation_id );
        if ( ! $variation || ! is_a( $variation, 'WC_Product_Variation' ) ) {
            return rest_ensure_response([
                'message' => '',
            ]);
        }

        $stock_settings = commercekit_get_stock_settings();

        if ( $stock_settings['enable_message'] !== 'on' ) {
            return rest_ensure_response([
                'message' => '',
            ]);
        }

        $stock_quantity = $variation->get_stock_quantity();
        if ( is_null( $stock_quantity ) ) {
            return rest_ensure_response([
                'message' => '',
            ]);
        }

        $customer_message = '';

        if ( $stock_quantity <= $stock_settings['low_threshold'] ) {
            $customer_message = $stock_settings['low_customer_message'];
        } elseif ( $stock_quantity <= $stock_settings['medium_threshold'] ) {
            $customer_message = $stock_settings['medium_customer_message'];
        } elseif ( $stock_quantity >= $stock_settings['high_threshold'] ) {
            $customer_message = $stock_settings['high_customer_message'];
        }

        return rest_ensure_response([
            'message' => $customer_message,
            'stock_quantity' => $stock_quantity,
        ]);
    }

    public function variation_stock_permission() {
        return true;
    }
}
