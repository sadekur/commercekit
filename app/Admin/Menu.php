<?php

namespace CommerceKit\Commerce\Admin;

use CommerceKit\Commerce\Classes\Trait\Hookable;

class Menu {
    use Hookable;

    function __construct() {
        $this->action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        $this->action( 'admin_head',  [ $this, 'inject_submenu_visibility' ] );
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
     * Runs on every admin page (admin_head). Hides submenu items whose feature
     * is disabled so they never appear in the WordPress hover flyout. React
     * re-uses the same <li> elements on the CommerceKit page for instant
     * show/hide without a page reload.
     */
    public function inject_submenu_visibility() {
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

        if ( empty( $hidden_hashes ) ) {
            return;
        }
        ?>
        <script>
        (function () {
            var hidden = <?php echo wp_json_encode( $hidden_hashes ); ?>;
            function syncMenuVisibility() {
                var menu = document.querySelector('#adminmenu .toplevel_page_commerce-kit');
                if ( ! menu ) return;
                hidden.forEach( function ( hash ) {
                    var anchor = menu.querySelector( 'a[href*="' + hash + '"]' );
                    if ( anchor ) {
                        var li = anchor.closest( 'li' );
                        if ( li ) li.style.display = 'none';
                    }
                } );
            }
            if ( document.readyState === 'loading' ) {
                document.addEventListener( 'DOMContentLoaded', syncMenuVisibility );
            } else {
                syncMenuVisibility();
            }
        })();
        </script>
        <?php
    }

}