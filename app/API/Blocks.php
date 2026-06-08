<?php
namespace CommerceKit\Commerce\API;

class Blocks {

    public function get_block_register_permission() {
        return true;
    }

    public function block_register_permission() {
        return current_user_can( 'manage_options' );
    }

    public function get_block_register() {
        $defaults = [
            'accordion'                => 'off',
            'category-products-slider' => 'off',
        ];

        $saved    = get_option( 'commerce_kit_block_settings', [] );
        $settings = array_merge( $defaults, is_array( $saved ) ? $saved : [] );

        return rest_ensure_response( $settings );
    }

    public function block_register( $request ) {
        $settings = $request->get_param( 'settings' );
        if ( is_array( $settings ) ) {
            update_option( 'commerce_kit_block_settings', $settings );
        }
        return rest_ensure_response( 'success' );
    }
}