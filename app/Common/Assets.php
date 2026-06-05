<?php
namespace CommerceKit\Commerce\Common;

use CommerceKit\Commerce\Classes\Trait\Hookable;

class Assets {
    use Hookable;

    public function __construct() {
        $this->action( 'wp_enqueue_scripts',          [ $this, 'enqueue_frontend_assets' ] );
        $this->action( 'admin_enqueue_scripts',       [ $this, 'enqueue_admin_assets' ] );
        $this->action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets_func' ] );
    }

    public function enqueue_common_assets() {
        wp_enqueue_script(
            'commerce-kit-admin-tailwind-script',
            COMMERCE_KIT_URL . 'build/tailwind.build.js',
            [],
            time(),
            true
        );
    }

    /**
     * Fires only inside the block editor.
     * Loads block registration JS (registerBlockType) and editor dependencies.
     * Must never run on the frontend — wp-editor pulls in heartbeat/autosave
     * which interferes with WooCommerce cart session management.
     */
    public function enqueue_block_editor_assets_func() {
        wp_enqueue_script(
            'commerce-kit-block-script',
            COMMERCE_KIT_URL . 'build/block.build.js',
            [ 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-block-editor' ],
            time(),
            true
        );
        wp_localize_script( 'commerce-kit-block-script', 'COMMERCEKIT', [
            'activeBlocks' => commerce_kit_get_active_blocks(),
        ] );
        $this->enqueue_common_assets();
    }

    /**
     * Fires on every frontend page.
     * Loads accordion/variation JS and styles needed for frontend block rendering.
     */
    public function enqueue_frontend_assets() {
        $ck_settings = get_option( 'commerce_kit_settings', [] );

        wp_enqueue_script(
            'commerce-kit-frontend-script',
            COMMERCE_KIT_ASSETS . '/js/frontend.js',
            [ 'jquery' ],
            filemtime( COMMERCE_KIT_PATH . 'assets/js/frontend.js' ),
            true
        );

        $ck_data = [
            'ajaxurl'    => admin_url( 'admin-ajax.php' ),
            'adminurl'   => admin_url(),
            'resturl'    => untrailingslashit( rest_url( 'commerce-kit/v1' ) ),
            'nonce'      => wp_create_nonce( 'commerce-kit' ),
            'error'      => __( 'Something went wrong', 'commerce-kit' ),
            'is_blocks'  => commercekit_is_blocks_page(),
        ];

        // Tips feature assets — only on cart/checkout pages when the feature is enabled.
        if ( ( $ck_settings['woocommerce-tips'] ?? '' ) === 'on' && ( is_cart() || is_checkout() ) ) {
            wp_enqueue_style(
                'ck-tips-style',
                COMMERCE_KIT_URL . 'features/woocommerce-tips/tips.css',
                [],
                filemtime( COMMERCE_KIT_PATH . 'features/woocommerce-tips/tips.css' )
            );
            wp_enqueue_script(
                'ck-tips-script',
                COMMERCE_KIT_URL . 'features/woocommerce-tips/tips.js',
                [ 'commerce-kit-frontend-script' ],
                filemtime( COMMERCE_KIT_PATH . 'features/woocommerce-tips/tips.js' ),
                true
            );
            // Separate nonce for tip AJAX actions — verified with check_ajax_referer('ck_tips_nonce').
            $ck_data['tips_nonce'] = wp_create_nonce( 'ck_tips_nonce' );
        }

        if ( ( $ck_settings['buy-button-for-woocommerce'] ?? '' ) === 'on' ) {
            $bb = commercekit_get_buy_button_settings();

            $ck_data['buy_button'] = [
                'nonce'               => wp_create_nonce( 'ck_buy_button_nonce' ),
                'is_ajax'             => $bb['ajax_add_to_cart'],
                'button_text'         => $bb['button_text'] ?: 'Buy Now',
                'i18n_select_options' => __( 'Please select product options before clicking Buy Now.', 'commerce-kit' ),
            ];

            wp_enqueue_script(
                'ck-buy-button-script',
                COMMERCE_KIT_URL . 'features/buy-button-for-woocommerce/buy-button.js',
                [ 'commerce-kit-frontend-script' ],
                filemtime( COMMERCE_KIT_PATH . 'features/buy-button-for-woocommerce/buy-button.js' ),
                true
            );
        }

        wp_localize_script( 'commerce-kit-frontend-script', 'COMMERCEKIT', $ck_data );

        wp_enqueue_style(
            'commerce-kit-frontend-style',
            COMMERCE_KIT_ASSETS . '/css/frontend.css',
            [],
            filemtime( COMMERCE_KIT_PATH . 'assets/css/frontend.css' )
        );
        $this->enqueue_common_assets();
    }

    /**
     * Fires on every admin page (including the block editor).
     * Block editor additionally gets enqueue_block_editor_assets_func via its own hook.
     */
    public function enqueue_admin_assets() {
        wp_enqueue_script(
            'commerce-kit-admin-script',
            COMMERCE_KIT_ASSETS . '/js/admin.js',
            [ 'jquery' ],
            filemtime( COMMERCE_KIT_PATH . 'assets/js/admin.js' ),
            true
        );

        wp_enqueue_script(
            'commerce-kit-block-script',
            COMMERCE_KIT_URL . 'build/block.build.js',
            [ 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ],
            time(),
            true
        );

        wp_enqueue_script(
            'commerce-kit-init-script',
            COMMERCE_KIT_ASSETS . '/js/init.js',
            [],
            filemtime( COMMERCE_KIT_PATH . 'assets/js/init.js' ),
            true
        );

        wp_enqueue_script(
            'commerce-kit-menu-script',
            COMMERCE_KIT_URL . 'build/admin.build.js',
            [ 'commerce-kit-admin-script' ],
            time(),
            true
        );

        $settings       = get_option( 'commerce_kit_settings', [] );
        $feature_hashes = [
            'stock-threshold-for-wc'     => '#/stock-threshold',
            'woocommerce-tips'           => '#/commerce-kit-tip-settings',
            'buy-button-for-woocommerce' => '#/buy-button-settings',
        ];
        $hidden_hashes = [];
        foreach ( $feature_hashes as $key => $hash ) {
            if ( ( $settings[ $key ] ?? '' ) !== 'on' ) {
                $hidden_hashes[] = $hash;
            }
        }

        wp_localize_script( 'commerce-kit-admin-script', 'COMMERCEKIT', [
            'nonce'         => wp_create_nonce( 'wp_rest' ),
            'adminurl'      => admin_url(),
            'ajaxurl'       => admin_url( 'admin-ajax.php' ),
            'apiurl'        => untrailingslashit( rest_url( 'commerce-kit/v1' ) ),
            'settings_data' => $settings,
            'hiddenHashes'  => $hidden_hashes,
            'error'         => __( 'Something went wrong', 'commerce-kit' ),
        ] );

        wp_enqueue_style(
            'commerce-kit-admin-style',
            COMMERCE_KIT_ASSETS . '/css/admin.css',
            [],
            filemtime( COMMERCE_KIT_PATH . 'assets/css/admin.css' )
        );

        wp_enqueue_style(
            'commerce-kit-init-style',
            COMMERCE_KIT_ASSETS . '/css/init.css',
            [],
            filemtime( COMMERCE_KIT_PATH . 'assets/css/init.css' )
        );

        wp_enqueue_style(
            'jquery-ui',
            'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css',
            [],
            null
        );

        $this->enqueue_common_assets();
    }
}
