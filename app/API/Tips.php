<?php
namespace CommerceKit\Commerce\API;

class Tips {

    private function defaults(): array {
        return [
            'tcwt_cart'      => 'off',
            'tcwt_checkout'  => 'off',
            'tcwt_note'      => 'off',
            'tcwt_btncolor'  => '#289dcc',
            'tcwt_btntext'   => 'Add Donation',
            'tcwt_textcolor' => '#ffffff',
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

        $on_off_keys = [ 'tcwt_cart', 'tcwt_checkout', 'tcwt_note' ];
        $settings    = [];

        foreach ( $on_off_keys as $key ) {
            $val             = sanitize_text_field( $body[ $key ] ?? $defaults[ $key ] );
            $settings[ $key ] = ( $val === 'on' ) ? 'on' : 'off';
        }

        $settings['tcwt_btncolor']  = sanitize_hex_color( $body['tcwt_btncolor']  ?? $defaults['tcwt_btncolor'] )  ?: $defaults['tcwt_btncolor'];
        $settings['tcwt_textcolor'] = sanitize_hex_color( $body['tcwt_textcolor'] ?? $defaults['tcwt_textcolor'] ) ?: $defaults['tcwt_textcolor'];
        $settings['tcwt_btntext']   = sanitize_text_field( $body['tcwt_btntext']  ?? $defaults['tcwt_btntext'] );

        update_option( 'commercekit-tips-settings', $settings );
        return rest_ensure_response( $settings );
    }
}
