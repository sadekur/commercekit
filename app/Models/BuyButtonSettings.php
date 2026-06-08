<?php
namespace CommerceKit\Commerce\Models;

class BuyButtonSettings {

    public static function get(): array {
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
        $settings = array_merge( $defaults, is_array( $saved ) ? $saved : [] );

        foreach ( [ 'button_margin', 'button_padding' ] as $key ) {
            if ( isset( $saved[ $key ] ) && is_array( $saved[ $key ] ) ) {
                $settings[ $key ] = array_merge( $defaults[ $key ], $saved[ $key ] );
            }
        }

        return $settings;
    }
}
