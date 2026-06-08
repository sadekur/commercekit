<?php
namespace CommerceKit\Commerce;
use CommerceKit\Commerce\Support\Traits\Hookable;

class Features {
    use Hookable;

    public function __construct() {
        $this->filter( 'init', [ $this, 'features_register' ] );
    }

    public function features_register() {
        $settings = get_option( 'commerce_kit_settings', [] );
        $features = [
            'woocommerce-tips'              => 'woocommerce-tips',
            'woocommerce-faq'               => 'woocommerce-faq',
            'woocommerce-product_barcode'   => 'woocommerce-product-barcode',
            'buy-button-for-woocommerce'    => 'buy-button-for-woocommerce',
            'stock-threshold-for-wc'        => 'stock-threshold-for-wc',
        ];

        foreach ( $features as $feature_key => $feature_directory ) {
            if ( isset( $settings[$feature_key] ) && $settings[$feature_key] === 'on' ) {
                $file = COMMERCE_KIT_PATH . "features/{$feature_directory}/{$feature_directory}.php";

                if ( file_exists ( $file ) ) {
                    require_once $file;
                    $class_name = str_replace( ' ', '', ucwords( str_replace( ['-', '_'], ' ', $feature_directory ) ) );
                    $class = "\\CommerceKit\\Commerce\\Features\\{$class_name}";
                    if ( class_exists( $class ) ) {
                        new $class();
                    }
                }
            }
        }
    }
}
