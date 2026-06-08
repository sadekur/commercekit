<?php
namespace CommerceKit\Commerce\API;

use CommerceKit\Commerce\Models\BuyButtonSettings;

class BuyButton {

    public function get_settings_permission() {
        return current_user_can( 'manage_options' );
    }

    public function save_settings_permission() {
        return current_user_can( 'manage_options' );
    }

    public function get_settings() {
        return rest_ensure_response( commercekit_get_buy_button_settings() );
    }

    public function save_settings( \WP_REST_Request $request ) {
        $body     = $request->get_json_params() ?? [];
        $defaults = commercekit_get_buy_button_settings();
        $settings = [];

        // Plain string / toggle fields
        foreach ( [
            'enable_single', 'enable_archive',
            'button_position_single', 'button_position_archive',
            'redirect_location', 'button_text',
            'reset_cart', 'ajax_add_to_cart', 'hide_add_to_cart', 'button_style',
            'button_text_color', 'button_background_color', 'button_border_color',
        ] as $key ) {
            $settings[ $key ] = isset( $body[ $key ] )
                ? sanitize_text_field( $body[ $key ] )
                : $defaults[ $key ];
        }

        $settings['custom_redirect_url'] = isset( $body['custom_redirect_url'] )
            ? esc_url_raw( $body['custom_redirect_url'] )
            : $defaults['custom_redirect_url'];

        $settings['default_shop_quantity'] = max( 1, absint( $body['default_shop_quantity'] ?? $defaults['default_shop_quantity'] ) );

        // Optional integer fields — keep as empty string when not set
        foreach ( [ 'button_border_size', 'button_border_radius', 'button_font_size' ] as $key ) {
            $val              = $body[ $key ] ?? '';
            $settings[ $key ] = ( $val !== '' && $val !== null ) ? absint( $val ) : '';
        }

        // Dimension arrays (margin / padding) — store all four sides
        foreach ( [ 'button_margin', 'button_padding' ] as $key ) {
            $raw       = $body[ $key ] ?? $defaults[ $key ];
            $sanitized = [];
            foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
                $val              = $raw[ $side ] ?? '';
                $sanitized[$side] = ( $val !== '' && $val !== null ) ? absint( $val ) : '';
            }
            $settings[ $key ] = $sanitized;
        }

        update_option( 'commerce_kit_buy_button_settings', $settings );
        return rest_ensure_response( $settings );
    }
}
