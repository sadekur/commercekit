<?php
namespace CommerceKit\Commerce;

use CommerceKit\Commerce\Support\Trait\Hookable;

class Blocks {
    use Hookable;

    public $categories = [];

    public function __construct() {
        $this->action( 'init', [ $this, 'set_categories' ] );
        $this->filter( 'init', [ $this, 'blocks_register' ] );
        $this->filter( 'block_categories_all', [ $this, 'add_custom_categories' ] );
    }

    public function set_categories() {
        $this->categories = [
            'product' => __( 'CommerceKit - WooCommerce', 'commerce-kit' ),
        ];
    }

    public function blocks_register() {
        foreach ( self::get_active_blocks() as $block_name ) {
            register_block_type( COMMERCE_KIT_PATH . 'blocks/' . $block_name );
        }
    }

    public static function get_active_blocks(): array {
        $block_settings = maybe_unserialize( get_option( 'commerce_kit_block_settings', [] ) );
        $active_blocks  = [];

        foreach ( glob( COMMERCE_KIT_PATH . 'blocks/*', GLOB_ONLYDIR ) ?: [] as $block_path ) {
            $block_name = basename( $block_path );
            if ( isset( $block_settings[ $block_name ] ) && $block_settings[ $block_name ] === 'on' ) {
                $active_blocks[] = $block_name;
            }
        }

        return $active_blocks;
    }

    /**
     * Register custom block categories.
     *
     * @param array $categories Existing block categories.
     * @return array Updated block categories.
     */
    // public function add_custom_categories($categories) {
    //     $new_categories = [];

    //     foreach ($this->categories as $id => $label) {
    //         $new_categories[] = [
    //             'slug' => "commerce-kit-{$id}",
    //             'title' => $label,
    //         ];
    //     }

    //     return array_merge($categories, $new_categories);
    // }

    public function add_custom_categories( $categories ) {
        foreach ( $this->categories as $id => $label ) {
            array_unshift( $categories, [
                'slug' => "commerce-kit-{$id}",
                'title' => $label,
            ] );
        }
    
        return $categories;
    }
    
}
