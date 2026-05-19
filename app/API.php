<?php
namespace CommerceKit\Commerce;

use CommerceKit\Commerce\Classes\Helper\Utility;
use CommerceKit\Commerce\Classes\Trait\Hookable;
use CommerceKit\Commerce\API\Stock_Threshold as Stock;
use CommerceKit\Commerce\API\Settings;
use CommerceKit\Commerce\API\Blocks;
use CommerceKit\Commerce\API\Tips;
use CommerceKit\Commerce\API\BuyButton;

class API {
    use Hookable;

    public function __construct() {

        $this->action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {

    // Register REST API routes for settings

        $this->register_route( '/get-settings', [
            'methods' => 'GET',
            'callback' => [ new Settings(), 'get_settings' ],
            'permission_callback' => [ new Settings(), 'get_settings_permission' ]
        ]);

        $this->register_route( '/post-settings', [
            'methods' => 'POST',
            'callback' => [ new Settings(), 'save_settings' ],
            'permission_callback' => [ new Settings(), 'save_settings_permission' ]
        ]);

        // Register REST API routes for blocks

        $this->register_route( '/get-block-register', [
            'methods' => 'GET',
            'callback' => [ new Blocks(), 'get_block_register' ],
            'permission_callback' => [ new Blocks(), 'get_block_register_permission' ]
        ]);

        $this->register_route( '/block-register-save', [
            'methods' => 'POST',
            'callback' => [ new Blocks(), 'block_register' ],
            'permission_callback' => [ new Blocks(), 'block_register_permission' ]
        ]);

        // Register REST API routes for tips

        $this->register_route( '/save-tips', [
            'methods' => 'POST',
            'callback' => [ new Tips(), 'commerce_kit_save_tips' ],
            'permission_callback' => [ new Tips(), 'tips_permission' ]
        ]);

        $this->register_route( '/get-tips', [
            'methods' => 'GET',
            'callback' => [ new Tips(), 'commerce_kit_get_tips' ],
            'permission_callback' => [ new Tips(), 'tips_permission' ]
        ]);

        // Register REST API routes for stock

        $this->register_route( '/save-stock-threshold', [
            'methods' => 'POST',
            'callback' => [ new Stock(), 'save_stock_threshold' ],
            'permission_callback' => [ new Stock(), 'stock_threshold_permission' ]
        ]);

        $this->register_route( '/get-stock-threshold', [
            'methods' => 'GET',
            'callback' => [ new Stock(), 'get_stock_threshold' ],
            'permission_callback' => [ new Stock(), 'stock_threshold_permission' ]
        ]);

        // Register REST API route for variation stock

        $this->register_route( '/get-variation-stock', [
            'methods' => 'GET',
            'callback' => [ new Stock(), 'get_variation_stock' ],
            'permission_callback' => [ new Stock(), 'variation_stock_permission' ]
        ]);
    }
}
