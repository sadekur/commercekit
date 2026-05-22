<?php

namespace CommerceKit\Commerce\Admin;

use CommerceKit\Commerce\Classes\Trait\Hookable;

class Menu {
    use Hookable;

    function __construct() {
        $this->action( 'admin_menu',             [ $this, 'add_admin_menu' ] );
        $this->action( 'admin_enqueue_scripts',  [ $this, 'enqueue_menu_visibility' ] );
    }

    public function add_admin_menu() {
        add_menu_page(
            'CommerceKit',
            'CommerceKit',
            'manage_options',
            'commerce-kit',
            [ $this, 'admin_page_content' ],
            'dashicons-admin-generic',
            20
        );

        add_submenu_page(
            'commerce-kit',
            __( 'Dashboard', 'commerce-kit' ),
            __( 'Dashboard', 'commerce-kit' ),
            'manage_options',
            'commerce-kit',
            [ $this, 'admin_page_content' ]
        );

        // Always register all feature submenus so their <li> elements are
        // present in the DOM on every admin page. inject_submenu_visibility()
        // hides the disabled ones via an inline admin_head script, which runs
        // globally (fixing the hover-flyout bug). React toggles display on the
        // CommerceKit page for instant show/hide without a page reload.
        add_submenu_page(
            'commerce-kit',
            __( 'Stock Threshold', 'commerce-kit' ),
            __( 'Stock Threshold', 'commerce-kit' ),
            'manage_options',
            'commerce-kit#/stock-threshold',
            [ $this, 'admin_page_content' ]
        );

        add_submenu_page(
            'commerce-kit',
            'CommerceKit Tips Settings',
            'Tips Settings',
            'manage_options',
            'commerce-kit#/commerce-kit-tip-settings',
            [ $this, 'admin_page_content' ]
        );

        add_submenu_page(
            'commerce-kit',
            __( 'Buy Button Settings', 'commerce-kit' ),
            __( 'Buy Button', 'commerce-kit' ),
            'manage_options',
            'commerce-kit#/buy-button-settings',
            [ $this, 'admin_page_content' ]
        );
    }

    public function admin_page_content() {
        ?>
        <div class="wrap">
            <div id="commerce_kit_render"></div>
        </div>
        <?php
    }

    /**
     * Runs on every admin page. Enqueues the menu-visibility script and passes
     * the list of disabled feature hashes so the script can hide them from the
     * WordPress sidebar (including the hover flyout on non-CommerceKit pages).
     */
    public function enqueue_menu_visibility() {
        $settings = get_option( 'commerce_kit_settings', [] );

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

        wp_enqueue_script(
            'commerce-kit-menu-visibility',
            COMMERCE_KIT_ASSETS . 'js/menu-visibility.js',
            [],
            filemtime( COMMERCE_KIT_PATH . 'assets/js/menu-visibility.js' ),
            true
        );

        wp_localize_script( 'commerce-kit-menu-visibility', 'CommerceKitMenu', [
            'hiddenHashes' => $hidden_hashes,
        ] );
    }

}