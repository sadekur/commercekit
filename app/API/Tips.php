<?php
namespace CommerceKit\Commerce\API;

class Tips {

    private function defaults(): array {
        return [
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
    }

    public function tips_permission(): bool {
        return current_user_can( 'manage_options' );
    }

    public function commerce_kit_get_tips(): \WP_REST_Response {
        $saved    = get_option( 'commercekit-tips-settings', [] );
        $settings = array_merge( $this->defaults(), is_array( $saved ) ? $saved : [] );
        return rest_ensure_response( $settings );
    }

    public function commerce_kit_save_tips( \WP_REST_Request $request ): \WP_REST_Response {
        $body     = $request->get_json_params() ?? [];
        $defaults = $this->defaults();
        $settings = [];

        // on/off fields
        foreach ( [ 'tcwt_cart', 'tcwt_checkout', 'tcwt_taxable' ] as $key ) {
            $val            = sanitize_text_field( $body[ $key ] ?? $defaults[ $key ] );
            $settings[$key] = ( $val === 'on' ) ? 'on' : 'off';
        }

        // yes/no fields
        foreach ( [ 'tcwt_custom', 'tcwt_cash', 'tcwt_clear' ] as $key ) {
            $val            = sanitize_text_field( $body[ $key ] ?? $defaults[ $key ] );
            $settings[$key] = ( $val === 'yes' ) ? 'yes' : 'no';
        }

        $settings['tcwt_title'] = sanitize_text_field( $body['tcwt_title'] ?? $defaults['tcwt_title'] );

        $settings['tcwt_type'] = in_array( $body['tcwt_type'] ?? '', [ 'percent', 'fixed' ], true )
            ? sanitize_text_field( $body['tcwt_type'] )
            : $defaults['tcwt_type'];

        // Keep only positive integers from the rates string.
        $raw_rates        = sanitize_text_field( $body['tcwt_rates'] ?? $defaults['tcwt_rates'] );
        $clean_rates      = array_filter( array_map( 'absint', explode( ',', $raw_rates ) ) );
        $settings['tcwt_rates'] = $clean_rates ? implode( ',', $clean_rates ) : $defaults['tcwt_rates'];

        update_option( 'commercekit-tips-settings', $settings );
        return rest_ensure_response( $settings );
    }
}
