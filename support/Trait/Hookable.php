<?php
namespace CommerceKit\Commerce\Classes\Trait;

trait Hookable {
    public $namespace = 'commerce-kit/v1'; // Define the default namespace
    /**
     * Add a WordPress action hook.
     *
     * @param string   $hook          The name of the WordPress action to be hooked.
     * @param callable $callback      The callback to be run when the action is executed.
     * @param int      $priority      Optional. The priority at which the function should be fired. Default is 10.
     * @param int      $accepted_args Optional. The number of arguments that should be passed to the callback. Default is 1.
     */
    public function action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
        add_action( $hook, $callback, $priority, $accepted_args );
    }

    /**
     * Add a WordPress filter hook.
     *
     * @param string   $hook          The name of the WordPress filter to be hooked.
     * @param callable $callback      The callback to be run when the filter is applied.
     * @param int      $priority      Optional. The priority at which the function should be fired. Default is 10.
     * @param int      $accepted_args Optional. The number of arguments that should be passed to the callback. Default is 1.
     */
    public function filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
        add_filter( $hook, $callback, $priority, $accepted_args );
    }

     /**
     * Add a WordPress shortcode.
     *
     * @param string   $tag      The name of the shortcode.
     * @param callable $callback The callback function to handle the output of the shortcode.
     */
    public function add_shortcode($tag, $callback) {
        add_shortcode($tag, $callback);
    }

   /**
     * Register a REST route.
     *
     * @param string|null $namespace  The namespace for the REST route. Defaults to $this->namespace.
     * @param string      $path       The path for the REST route.
     * @param array       $args       The arguments for the REST route, including 'methods', 'callback', etc.
     */
    public function register_route( $path, $args, $namespace = null ) {
        // Use the default namespace if none is provided.
        $namespace = $namespace ?: $this->namespace;

        // If a permission callback is specified in the arguments, set it correctly.
        if( isset( $args[ 'permission' ] ) ) {
            $args[ 'permission_callback '] = $args[ 'permission' ];
            unset( $args[ 'permission' ] );
        }

        // Register the route with the specified namespace, path, and arguments.
        register_rest_route( $namespace, $path, $args );
    }
    
}