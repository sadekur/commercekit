<?php
/**
 * Plugin Name:       CommerceKit
 * Plugin URI:        https://commercekit.com
 * Description:       WooCommerce enhancement toolkit by CommerceKit.
 * Version:           1.0.0
 * Requires at least: 5.9
 * Requires PHP:      7.2
 * Author:            Sadekur Rahman
 * Author URI:        https://sadekurrahman.net
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       commerce-kit
 * Domain Path: 	  /languages
 * Tested up to: 	  6.9
 * WC requires at least: 5.0
 * Requires Plugins:  woocommerce
 *


 * The main plugin class
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/vendor/autoload.php';


final class COMMERCE_KIT{

	/**
	 * Plugin version
	 *
	 * @var string
	 */
	const version = '1.0';

	/**
	 * Class construcotr
	 */
	private function __construct() {
		$this->define_constants();

		add_action( 'plugins_loaded', [ $this, 'init_plugin' ] );
	}

	public static function init() {
		static $instance = false;

		if ( ! $instance ) {
			$instance = new self();
		}

		return $instance;
	}

	/**
	 * Define the required plugin constants
	 *
	 * @return void
	 */
	public function define_constants() {
		define( 'COMMERCE_KIT_VERSION', self::version );
		define( 'COMMERCE_KIT_FILE', __FILE__ );
		define( 'COMMERCE_KIT_PATH', plugin_dir_path(__FILE__) );
		define( 'COMMERCE_KIT_URL', plugin_dir_url(__FILE__) );
		define( 'COMMERCE_KIT_ASSETS', COMMERCE_KIT_URL . 'assets' );
	}

	/**
	 * Initialize the plugin
	 *
	 * @return void
	 */
	public function init_plugin() {

		new CommerceKit\Commerce\Common\Assets();
		new CommerceKit\Commerce\Email();
		new CommerceKit\Commerce\Common\API();
		new CommerceKit\Commerce\Common\Init();
		new CommerceKit\Commerce\Blocks();
		new CommerceKit\Commerce\Features();
		new CommerceKit\Commerce\Helper();

		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			new CommerceKit\Commerce\Ajax();
		}

		if ( is_admin() ) {
			new CommerceKit\Commerce\Admin\Menu();
		}

	}
}
function commerce_kit() {
	return COMMERCE_KIT::init();
}

commerce_kit();