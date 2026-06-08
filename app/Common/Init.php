<?php
namespace CommerceKit\Commerce\Common;
use CommerceKit\Commerce\Support\Trait\Hookable;

defined( 'ABSPATH' ) || exit;


class Init {
	use Hookable;

	/**
	 * Constructor to add all hooks.
	 */
	public function __construct() {
		$this->action( 'wp_head', [ $this, 'modal' ] );
		$this->action( 'admin_head', [ $this, 'modal' ] );
	}

	public function modal() {
		echo '
		<div id="commerce-kit-modal" style="display: none">
			<img id="commerce-kit-modal-loader" src="' . esc_attr( COMMERCE_KIT_ASSETS . '/img/loader.gif' ) . '" />
		</div>';
	}

}