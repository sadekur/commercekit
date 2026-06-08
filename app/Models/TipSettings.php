<?php
namespace CommerceKit\Commerce\Models;

class TipSettings {

    public static function get(): array {
        $defaults = [
            'tcwt_cart'     => 'off',
            'tcwt_checkout' => 'off',
            'tcwt_taxable'  => 'off',
            'tcwt_title'    => 'Send us a tip',
            'tcwt_type'     => 'percent',
            'tcwt_rates'    => '5,10,15,20,25,30',
            'tcwt_custom'   => 'yes',
            'tcwt_cash'     => 'yes',
            'tcwt_clear'    => 'yes',
        ];

        $saved = get_option( 'commercekit-tips-settings', [] );
        return array_merge( $defaults, is_array( $saved ) ? $saved : [] );
    }
}
