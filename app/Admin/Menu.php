<?php

namespace CommerceKit\Commerce\Admin;

use CommerceKit\Commerce\Classes\Trait\Hookable;

class Menu {
    use Hookable;

    function __construct() {
        $this->action( 'admin_menu', [ $this, 'add_admin_menu' ] );
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

        // Register feature submenus only when the feature is enabled so that
        // WordPress does not render disabled submenus in the hover flyout on
        // other admin pages (where the React SPA is not mounted to hide them).
        $settings = get_option( 'commerce_kit_settings', [] );

        if ( ( $settings['stock-threshold-for-wc'] ?? '' ) === 'on' ) {
            add_submenu_page(
                'commerce-kit',
                __( 'Stock Threshold', 'commerce-kit' ),
                __( 'Stock Threshold', 'commerce-kit' ),
                'manage_options',
                'commerce-kit#/stock-threshold',
                [ $this, 'admin_page_content' ]
            );
        }

        if ( ( $settings['woocommerce-tips'] ?? '' ) === 'on' ) {
            add_submenu_page(
                'commerce-kit',
                'CommerceKit Tips Settings',
                'Tips Settings',
                'manage_options',
                'commerce-kit#/commerce-kit-tip-settings',
                [ $this, 'admin_page_content' ]
            );
        }

        if ( ( $settings['buy-button-for-woocommerce'] ?? '' ) === 'on' ) {
            add_submenu_page(
                'commerce-kit',
                __( 'Buy Button Settings', 'commerce-kit' ),
                __( 'Buy Button', 'commerce-kit' ),
                'manage_options',
                'commerce-kit#/buy-button-settings',
                [ $this, 'admin_page_content' ]
            );
        }
    }

    public function admin_page_content() {
        ?>
        <div class="wrap">
            <div id="commerce_kit_render"></div>
        </div>
        <?php
    }

}