<?php
namespace CommerceKit\Commerce\Classes\Helper;

defined( 'ABSPATH' ) || exit;


/**
 * Utility class with static helper functions for general use throughout the plugin.
 */
class Utility {


	/**
	 * Retrieves an option from the WordPress database, formatted according to CommerceKit settings.
	 *
	 * @param string $menu     The menu name used as part of the option name.
	 * @param string $submenu  The submenu name used as part of the option name.
	 * @param string $key      The specific option key to retrieve.
	 * @param mixed  $default  Default value if key is not set.
	 *
	 * @return mixed
	 */
	public static function get_option( $menu, $submenu, $key = null, $default = '' ) {
		$option = get_option( "commercekit-{$menu}-{$submenu}", [] );

		if ( ! is_array( $option ) ) {
			return $default;
		}

		if ( $key === null ) {
			return array_merge( (array) $default, $option );
		}

		return isset( $option[$key] ) ? $option[$key] : $default;
	}


	/**
	 * Formats a date string according to WordPress settings.
	 *
	 * @param string $date   The date string (e.g., 'Y-m-d H:i:s').
	 * @param string $format Optional. PHP date format. Defaults to WordPress date format setting.
	 * @return string
	 */
	public static function format_date( $date, $format = '' ) {
		if ( empty( $format ) ) {
			$format = get_option( 'date_format' );
		}

		return date_i18n( $format, strtotime( $date ) );
	}

	/**
	 * Prints information about a variable in a readable format (admin-only debug helper).
	 *
	 * @param mixed $data
	 * @param bool  $admin_only
	 * @param bool  $hide_adminbar
	 */
	public static function pri( $data, $admin_only = true, $hide_adminbar = true ) {
		if ( $admin_only && ! current_user_can( 'manage_options' ) ) {
			return;
		}

		echo '<pre>';
		if ( is_object( $data ) || is_array( $data ) ) {
			print_r( $data );
		} else {
			var_dump( $data );
		}
		echo '</pre>';

		if ( is_admin() && $hide_adminbar ) {
			echo '<style>#adminmenumain{display:none;}</style>';
		}
	}

	/**
	 * Includes a template file from the app/settings/ directory.
	 *
	 * @param string $template_name  Template file name (without .php).
	 * @param string $path           Unused legacy parameter.
	 * @param array  $data           Variables to extract into the template scope.
	 * @return string
	 */
    public static function get_template( $template_name, $path, $data = [] ) {
        $template_path = COMMERCE_KIT_PATH . 'app/settings/' . $template_name . '.php';

        if ( file_exists( $template_path ) ) {
            extract( $data );
            ob_start();
            include $template_path;
            return ob_get_clean();
        }

        return '<p>' . esc_html__( 'Template not found!', 'commerce-kit' ) . '</p>';
    }
}
