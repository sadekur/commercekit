<?php

namespace CommerceKit\Commerce\Admin;

use CommerceKit\Commerce\Support\Traits\Hookable;

class Menu {
    use Hookable;

    function __construct() {
        $this->action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        $this->action( 'admin_init', [ $this, 'suppress_notices_on_our_pages' ] );
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

        // Always register all feature submenus so their <li> elements exist in
        // the DOM on every admin page. Assets.php passes hiddenHashes via the
        // COMMERCEKIT global; admin.js reads it and hides disabled items on load
        // (fixing the hover-flyout bug). React toggles display on the
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


}