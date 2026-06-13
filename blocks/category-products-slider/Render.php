<?php
require_once __DIR__ . '/render/HelpersTrait.php';
require_once __DIR__ . '/render/QueryTrait.php';
require_once __DIR__ . '/render/ItemTrait.php';
require_once __DIR__ . '/render/HtmlTrait.php';
require_once __DIR__ . '/render/StylesTrait.php';
require_once __DIR__ . '/render/ScriptTrait.php';

class CategoryProductsSliderRender {
    use CslHelpersTrait, CslQueryTrait, CslItemTrait, CslHtmlTrait, CslStylesTrait, CslScriptTrait;

    private array  $a;
    private string $uid = '';

    public function __construct( array $attributes ) {
        $this->a = $attributes;
    }

    public function render(): void {
        if ( ! class_exists( 'WooCommerce' ) ) {
            echo '<p class="p-4 bg-amber-50 border border-amber-300 rounded text-amber-800 text-sm">'
                . esc_html__( 'WooCommerce is required for the Category Products Slider block.', 'commerce-kit' )
                . '</p>';
            return;
        }

        $this->uid = 'ck-csl-' . wp_unique_id();
        $layout    = $this->a['layout']      ?? 'carousel';
        $cat_type  = $this->a['categoryType'] ?? 'parent';
        $disp_type = $this->a['displayType'] ?? 'individualize';
        $is_slider = in_array( $layout, [ 'carousel', 'slider' ], true );
        $is_cup    = ( $cat_type === 'all' && $disp_type === 'child_under_parent' );

        if ( $is_cup ) {
            $groups = $this->get_term_groups();
            if ( $groups === null ) return;
            $is_slider ? $this->html_cup_slider( $groups ) : $this->html_cup_static( $groups, $layout );
        } else {
            $terms = $this->get_terms();
            if ( $terms === null ) return;
            $is_slider ? $this->html_slider( $terms ) : $this->html_static( $terms, $layout );
        }

        $this->inline_styles();
        if ( $is_slider ) $this->inline_script();
    }
}
