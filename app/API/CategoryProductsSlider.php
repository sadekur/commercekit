<?php
namespace CommerceKit\Commerce\API;

class CategoryProductsSlider {

    public function grid_page_permission() {
        return true;
    }

    public function get_grid_page( \WP_REST_Request $request ) {
        if ( ! class_exists( 'WooCommerce' ) ) {
            return new \WP_Error( 'ck_csl_no_woocommerce', 'WooCommerce is required.', [ 'status' => 400 ] );
        }

        $block_type = \WP_Block_Type_Registry::get_instance()->get_registered( 'commerce-kit/category-products-slider' );
        if ( ! $block_type ) {
            return new \WP_Error( 'ck_csl_block_missing', 'Category Products Slider block is not registered.', [ 'status' => 500 ] );
        }

        $raw   = json_decode( (string) $request->get_param( 'atts' ), true );
        $atts  = $this->sanitize_atts( is_array( $raw ) ? $raw : [], $block_type->attributes );
        $page  = max( 1, absint( $request->get_param( 'page' ) ) );

        if ( ! class_exists( 'CategoryProductsSliderRender' ) ) {
            require_once COMMERCE_KIT_PATH . 'blocks/category-products-slider/Render.php';
        }

        $renderer = new \CategoryProductsSliderRender( $atts );
        $result   = $renderer->render_grid_page( $page );

        return rest_ensure_response( $result );
    }

    /**
     * Whitelists the incoming attributes against the block's own registered schema
     * and casts each to its declared type — unknown keys are dropped, missing keys
     * fall back to the block's defaults. The endpoint is public/unauthenticated, so
     * this is what keeps arbitrary request input from reaching the renderer as
     * anything other than a plain scalar of the expected type.
     */
    private function sanitize_atts( array $raw, array $schema ): array {
        $out = [];
        foreach ( $schema as $key => $def ) {
            $default = $def['default'] ?? null;
            if ( ! array_key_exists( $key, $raw ) ) {
                $out[ $key ] = $default;
                continue;
            }
            $val = $raw[ $key ];
            switch ( $def['type'] ?? 'string' ) {
                case 'boolean':
                    $out[ $key ] = (bool) $val;
                    break;
                case 'number':
                case 'integer':
                    $out[ $key ] = is_numeric( $val ) ? $val + 0 : $default;
                    break;
                default:
                    $out[ $key ] = sanitize_text_field( (string) $val );
                    break;
            }
        }
        return $out;
    }
}
