<?php
namespace CommerceKit\Commerce\Models;

class StockSettings {

    public static function get(): array {
        $defaults = [
            'low_threshold'           => 5,
            'low_increase'            => 40,
            'medium_threshold'        => 20,
            'medium_increase'         => 20,
            'high_threshold'          => 100,
            'high_decrease'           => 15,
            'enable_message'          => 'off',
            'low_customer_message'    => 'Low stock - high demand item',
            'medium_customer_message' => 'Medium stock - price adjusted',
            'high_customer_message'   => 'High stock - clearance price',
        ];

        $saved = get_option( 'commerce_kit_stock_threshold', [] );
        return array_merge( $defaults, is_array( $saved ) ? $saved : [] );
    }
}
