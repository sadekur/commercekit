<?php
/**
 * Render class for the Category Products Slider block.
 *
 * Responsibilities, one method each:
 *   render()         – entry point: WooCommerce check → load terms → output
 *   get_terms()      – DB query, shuffle, thumbnail filter
 *   html()           – full HTML markup
 *   inline_styles()  – per-instance <style> tag (dynamic attribute values)
 *   inline_script()  – Swiper initialisation <script>
 *   swiper_config()  – builds the Swiper JS config array
 *   thumb_br()       – thumbnail border-radius string
 *   shadow_css()     – box-shadow CSS string
 *   border_css()     – thumbnail border CSS string
 *   nav_svgs()       – returns [prev_svg, next_svg] for the chosen icon style
 */
class CategoryProductsSliderRender {

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

        $terms = $this->get_terms();
        if ( $terms === null ) return;

        $this->uid = 'ck-csl-' . wp_unique_id();
        $this->html( $terms );
        $this->inline_styles();
        $this->inline_script();
    }

    // ── Category query

    private function get_terms(): ?array {
        $a    = $this->a;
        $args = [
            'taxonomy'   => 'product_cat',
            'hide_empty' => ! empty( $a['hideEmpty'] ),
            'number'     => max( 1, intval( $a['totalCategories'] ?? 12 ) ),
        ];

        if ( empty( $a['randomize'] ) ) {
            $args['orderby'] = $a['orderBy'] ?? 'name';
            $args['order']   = $a['order']   ?? 'ASC';
        }

        if ( ( $a['filterType'] ?? '' ) === 'specific' && ! empty( $a['specificCategories'] ) ) {
            $ids = array_map( 'intval', array_filter( array_map( 'trim', explode( ',', $a['specificCategories'] ) ) ) );
            if ( $ids ) {
                $args['include'] = $ids;
                unset( $args['number'] );
            }
        }

        $default_cat = (int) get_option( 'default_product_cat', 0 );
        if ( $default_cat > 0 ) {
            $args['exclude'] = [ $default_cat ];
        }

        $terms = get_terms( $args );

        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            echo '<p class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">'
                . esc_html__( 'No product categories found.', 'commerce-kit' ) . '</p>';
            return null;
        }

        if ( ! empty( $a['randomize'] ) ) {
            shuffle( $terms );
        }

        if ( ! empty( $a['hideCatWithoutThumb'] ) ) {
            $terms = array_values( array_filter( $terms, fn( $t ) => get_term_meta( $t->term_id, 'thumbnail_id', true ) ) );
            if ( empty( $terms ) ) {
                echo '<p class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">'
                    . esc_html__( 'No categories with thumbnails found.', 'commerce-kit' ) . '</p>';
                return null;
            }
        }

        return $terms;
    }

    // ── HTML markup ───────────────────────────────────────────────────────────────

    private function html( array $terms ): void {
        $a   = $this->a;
        $uid = $this->uid;

        $rtl         = ! empty( $a['rtlDirection'] );
        $show_pager  = ! empty( $a['showSliderPagination'] );
        $show_nav    = isset( $a['showNavigation'] ) ? (bool) $a['showNavigation'] : true;
        $content_pos = $a['contentPosition'] ?? 'below';
        $is_overlay  = in_array( $content_pos,
            [ 'overlay', 'overlay_top', 'overlay_middle', 'overlay_bottom', 'overlay_box' ], true );

        $show_title = isset( $a['showSectionTitle'] ) ? (bool) $a['showSectionTitle'] : true;
        $title_text = sanitize_text_field( $a['sectionTitleText'] ?? 'Category Showcase' );
        $equal_h    = isset( $a['equalHeight'] ) ? (bool) $a['equalHeight'] : true;

        $thumb_size = $a['thumbnailImgSize'] ?? 'medium';
        $show_thumb = isset( $a['showThumbnail'] ) ? (bool) $a['showThumbnail'] : true;

        $pad = esc_attr( intval( $a['contentPadTop'] ?? 15 ) . 'px '
            . intval( $a['contentPadRight'] ?? 10 ) . 'px '
            . intval( $a['contentPadBottom'] ?? 15 ) . 'px '
            . intval( $a['contentPadLeft']   ?? 10 ) . 'px' );

        $show_name    = isset( $a['showCatName'] ) ? (bool) $a['showCatName'] : true;
        $show_count   = ! empty( $a['showProductCount'] );
        $count_pos    = $a['productCountPos']    ?? 'beside';
        $count_before = $a['productCountBefore'] ?? '(';
        $count_after  = $a['productCountAfter']  ?? ')';
        $show_desc    = ! empty( $a['showDescription'] );
        $show_custom  = ! empty( $a['showCustomText'] );
        $custom_text  = sanitize_text_field( $a['customText'] ?? '' );
        $name_mt      = intval( $a['catNameMarginTop'] ?? 10 );
        $desc_mt      = intval( $a['descMarginTop']    ?? 6 );

        $show_shop   = ! empty( $a['showShopNow'] );
        $shop_label  = sanitize_text_field( $a['shopNowLabel'] ?? 'Shop Now' );
        $shop_align  = $a['shopNowAlignment'] ?? 'center';
        $shop_target = $a['shopNowTarget']    ?? '_self';
        $shop_mt     = intval( $a['shopNowMarginTop'] ?? 10 );

        [ $svg_prev, $svg_next ] = $this->nav_svgs();
        $nav_size = intval( $a['navIconSize'] ?? 22 );

        // ── Pre-computed class strings ────────────────────────────────────────────

        $wrap_cls = 'ck-csl-wrap relative w-full'
            . ( $rtl        ? ' ck-csl-rtl'      : '' )
            . ( $show_pager ? ' ck-csl-has-pager' : '' );

        $outer_cls = 'ck-csl-outer relative' . ( $show_nav ? ' ck-has-nav' : '' );

        $nav_wrap_cls = 'ck-csl-nav-wrap absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10 px-1.5'
            . ( $rtl ? ' flex-row-reverse' : '' );

        $nav_btn_cls = 'ck-csl-nav-btn flex items-center justify-center cursor-pointer pointer-events-auto transition-[background,color,border-color] duration-200 shrink-0 focus:outline focus:outline-2 focus:outline-[#0073aa] focus:outline-offset-2';

        $swiper_cls = 'swiper ck-csl-swiper overflow-hidden' . ( $show_pager ? ' pb-10' : '' );

        $slide_cls = 'swiper-slide ck-csl-slide box-border' . ( $equal_h ? ' h-full' : '' );

        // Structural + content-position Tailwind layout classes
        $item_cls = 'ck-csl-item relative flex flex-col bg-white rounded overflow-hidden ck-csl-pos-' . str_replace( '_', '-', $content_pos );
        if ( $equal_h )                  $item_cls .= ' ck-eq-height h-full';
        if ( 'above' === $content_pos )  $item_cls .= ' flex-col-reverse';
        if ( 'left'  === $content_pos )  $item_cls .= ' flex-row items-stretch';
        if ( 'right' === $content_pos )  $item_cls .= ' flex-row-reverse items-stretch';

        // Overflow + conditional width for side / overlay layouts
        $thumb_wrap_cls = 'ck-csl-thumb-wrap overflow-hidden leading-[0] relative';
        if ( in_array( $content_pos, [ 'left', 'right' ], true ) ) {
            $thumb_wrap_cls .= ' basis-[45%] max-w-[45%] shrink-0';
        } elseif ( $is_overlay ) {
            $thumb_wrap_cls .= ' flex-none w-full';
        }

        // flex-1 base + absolute positioning variant for each overlay mode
        $details_cls = 'ck-csl-details flex-1 transition-opacity duration-300';
        if ( $is_overlay ) {
            $details_cls .= ' absolute left-0 right-0 z-[2] text-white';
            if ( in_array( $content_pos, [ 'overlay', 'overlay_bottom' ], true ) ) {
                $details_cls .= ' bottom-0 top-auto';
            } elseif ( 'overlay_top'    === $content_pos ) {
                $details_cls .= ' top-0 bottom-auto';
            } elseif ( 'overlay_middle' === $content_pos ) {
                $details_cls .= ' top-1/2 -translate-y-1/2';
            } elseif ( 'overlay_box'    === $content_pos ) {
                $details_cls .= ' inset-0 flex flex-col justify-center';
            }
        }

        ob_start();
        ?>
<div id="<?php echo esc_attr( $uid ); ?>"
     class="<?php echo esc_attr( $wrap_cls ); ?>"
     dir="<?php echo $rtl ? 'rtl' : 'ltr'; ?>">

    <?php if ( $show_title && $title_text ) : ?>
        <h3 class="ck-csl-section-title text-[22px] font-bold text-[#222] m-0 mb-5 leading-[1.3]"><?php echo esc_html( $title_text ); ?></h3>
    <?php endif; ?>

    <div class="<?php echo esc_attr( $outer_cls ); ?>">

        <?php if ( $show_nav ) : ?>
        <div class="<?php echo esc_attr( $nav_wrap_cls ); ?>">
            <div class="ck-csl-prev <?php echo esc_attr( $nav_btn_cls ); ?>" role="button" aria-label="<?php esc_attr_e( 'Previous', 'commerce-kit' ); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="<?php echo esc_attr( $nav_size ); ?>" height="<?php echo esc_attr( $nav_size ); ?>"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <?php echo $svg_prev; // phpcs:ignore ?>
                </svg>
            </div>
            <div class="ck-csl-next <?php echo esc_attr( $nav_btn_cls ); ?>" role="button" aria-label="<?php esc_attr_e( 'Next', 'commerce-kit' ); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="<?php echo esc_attr( $nav_size ); ?>" height="<?php echo esc_attr( $nav_size ); ?>"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <?php echo $svg_next; // phpcs:ignore ?>
                </svg>
            </div>
        </div>
        <?php endif; ?>

        <div class="<?php echo esc_attr( $swiper_cls ); ?>">
            <div class="swiper-wrapper">
                <?php foreach ( $terms as $term ) :
                    if ( ! ( $term instanceof WP_Term ) ) continue;
                    $link      = get_term_link( $term );
                    $thumb_id  = get_term_meta( $term->term_id, 'thumbnail_id', true );
                    $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, $thumb_size ) : '';
                    ?>
                    <div class="<?php echo esc_attr( $slide_cls ); ?>">
                        <div class="<?php echo esc_attr( $item_cls ); ?>">

                            <?php if ( $show_thumb ) : ?>
                            <div class="<?php echo esc_attr( $thumb_wrap_cls ); ?>">
                                <?php if ( $thumb_url ) : ?>
                                    <a href="<?php echo esc_url( $link ); ?>" tabindex="-1">
                                        <img src="<?php echo esc_url( $thumb_url ); ?>"
                                             alt="<?php echo esc_attr( $term->name ); ?>"
                                             class="ck-csl-thumb w-full h-auto block [transition:transform_0.4s_ease,filter_0.3s_ease]" loading="lazy" />
                                    </a>
                                <?php else : ?>
                                    <div class="ck-csl-thumb-placeholder w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>

                            <?php if ( $is_overlay ) : ?>
                            <div class="ck-csl-overlay absolute inset-0 pointer-events-none z-[1] transition-[background] duration-300"></div>
                            <?php endif; ?>

                            <div class="<?php echo esc_attr( $details_cls ); ?>" style="padding:<?php echo $pad; ?>">

                                <?php if ( $show_name ) : ?>
                                <div class="ck-csl-cat-name" style="margin-top:<?php echo esc_attr( $name_mt ); ?>px">
                                    <a href="<?php echo esc_url( $link ); ?>" class="inline-block no-underline leading-[1.3] transition-opacity duration-200 hover:opacity-75">
                                        <?php echo esc_html( $term->name ); ?>
                                        <?php if ( $show_count && 'beside' === $count_pos ) : ?>
                                            <span class="ck-csl-count inline-block"><?php echo esc_html( $count_before . $term->count . $count_after ); ?></span>
                                        <?php endif; ?>
                                    </a>
                                </div>
                                <?php endif; ?>

                                <?php if ( $show_count && 'under' === $count_pos ) : ?>
                                <div class="ck-csl-product-count inline-block" style="margin-top:4px">
                                    <?php echo esc_html( $count_before . $term->count . $count_after ); ?>
                                </div>
                                <?php endif; ?>

                                <?php if ( $show_custom && $custom_text ) : ?>
                                <div class="ck-csl-custom-text mt-1.5"><?php echo esc_html( $custom_text ); ?></div>
                                <?php endif; ?>

                                <?php if ( $show_desc && $term->description ) : ?>
                                <div class="ck-csl-cat-desc leading-[1.6]" style="margin-top:<?php echo esc_attr( $desc_mt ); ?>px">
                                    <?php echo wp_kses_post( $term->description ); ?>
                                </div>
                                <?php endif; ?>

                                <?php if ( $show_shop ) : ?>
                                <div class="ck-csl-shop-now-wrap leading-none" style="margin-top:<?php echo esc_attr( $shop_mt ); ?>px;text-align:<?php echo esc_attr( $shop_align ); ?>">
                                    <a href="<?php echo esc_url( $link ); ?>"
                                       class="ck-csl-shop-now"
                                       target="<?php echo esc_attr( $shop_target ); ?>"
                                       <?php echo $shop_target === '_blank' ? 'rel="noopener noreferrer"' : ''; ?>>
                                        <?php echo esc_html( $shop_label ); ?>
                                    </a>
                                </div>
                                <?php endif; ?>

                            </div><!-- .ck-csl-details -->
                        </div><!-- .ck-csl-item -->
                    </div><!-- .swiper-slide -->
                <?php endforeach; ?>
            </div><!-- .swiper-wrapper -->

            <?php if ( $show_pager ) : ?>
            <div class="ck-csl-pager swiper-pagination text-center mt-[18px] !static"></div>
            <?php endif; ?>
        </div><!-- .swiper -->

    </div><!-- .ck-csl-outer -->
</div><!-- .ck-csl-wrap -->
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }

    // ── Per-instance dynamic CSS ──────────────────────────────────────────────────

    private function inline_styles(): void {
        $a   = $this->a;
        $uid = $this->uid;

        $thumb_zoom = $a['thumbnailZoom'] ?? 'none';
        $image_mode = $a['imageMode']     ?? 'normal';

        $overlay_bg  = $a['overlayBgColor']           ?? 'rgba(0,0,0,0.5)';
        $overlay_hvr = $a['overlayHoverBgColor']      ?? 'rgba(0,0,0,0.75)';
        $overlay_vis = $a['overlayContentVisibility'] ?? 'always';

        $cat_name_size   = intval( $a['catNameFontSize']   ?? 16 );
        $cat_name_weight = $a['catNameFontWeight']         ?? '700';
        $cat_name_color  = $a['catNameColor']              ?? '#333333';
        $count_size      = intval( $a['countFontSize']     ?? 13 );
        $count_color     = $a['countColor']                ?? '#888888';
        $desc_size       = intval( $a['descFontSize']      ?? 14 );
        $desc_color      = $a['descColor']                 ?? '#666666';
        $thumb_pad       = intval( $a['thumbInnerPad']     ?? 0 );
        $thumb_mb        = intval( $a['thumbMarginBottom'] ?? 0 );

        $shop_bg      = $a['shopNowBgColor']      ?? '#cc2b5e';
        $shop_hvr     = $a['shopNowHoverBg']      ?? '#a02049';
        $shop_color   = $a['shopNowTextColor']    ?? '#ffffff';
        $shop_radius  = intval( $a['shopNowBorderRadius'] ?? 3 );

        $nav_size    = intval( $a['navIconSize']         ?? 22 );
        $nav_color   = $a['navColor']                    ?? '#333333';
        $nav_hvr_c   = $a['navHoverColor']               ?? '#ffffff';
        $nav_bg      = $a['navBgColor']                  ?? '#ffffff';
        $nav_hvr_bg  = $a['navHoverBgColor']             ?? '#cc2b5e';
        $nav_border  = $a['navBorderColor']              ?? '#dddddd';
        $nav_hvr_bdr = $a['navHoverBorderColor']         ?? '#cc2b5e';
        $nav_radius  = intval( $a['navBorderRadius']     ?? 50 );

        $show_pager     = ! empty( $a['showSliderPagination'] );
        $pager_color    = $a['paginationColor']        ?? '#cc2b5e';
        $pager_active   = $a['paginationActiveColor']  ?? '#333333';

        ob_start();
        ?>
<style id="<?php echo esc_attr( $uid ); ?>-css">
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb {
    border-radius: <?php echo esc_attr( $this->thumb_br() ); ?>;
    border: <?php echo esc_attr( $this->border_css() ); ?>;
    box-shadow: <?php echo esc_attr( $this->shadow_css() ); ?>;
    padding: <?php echo esc_attr( $thumb_pad ); ?>px;
    margin-bottom: <?php echo esc_attr( $thumb_mb ); ?>px;
    <?php if ( 'grayscale' === $image_mode ) : ?>filter: grayscale(100%);<?php endif; ?>
}
<?php if ( 'zoom_in' === $thumb_zoom ) : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-wrap { overflow: hidden; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb { transition: transform 0.4s ease; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-wrap:hover .ck-csl-thumb { transform: scale(1.1); }
<?php elseif ( 'zoom_out' === $thumb_zoom ) : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-wrap { overflow: hidden; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb { transform: scale(1.1); transition: transform 0.4s ease; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-wrap:hover .ck-csl-thumb { transform: scale(1); }
<?php endif; ?>
<?php if ( 'grayscale' === $image_mode ) : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb { transition: filter 0.3s ease; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-wrap:hover .ck-csl-thumb { filter: grayscale(0%); }
<?php endif; ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-overlay {
    background: <?php echo esc_attr( $overlay_bg ); ?>;
    transition: background 0.3s ease<?php echo 'on_hover' === $overlay_vis ? ', opacity 0.3s ease' : ''; ?>;
    <?php echo 'on_hover' === $overlay_vis ? 'opacity:0;' : ''; ?>
}
<?php if ( 'on_hover' === $overlay_vis ) : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-item:hover .ck-csl-overlay { opacity:1; background:<?php echo esc_attr( $overlay_hvr ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-details { opacity:0; transition:opacity 0.3s ease; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-item:hover .ck-csl-details { opacity:1; }
<?php else : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-item:hover .ck-csl-overlay { background:<?php echo esc_attr( $overlay_hvr ); ?>; }
<?php endif; ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-cat-name a { font-size:<?php echo esc_attr( $cat_name_size ); ?>px; font-weight:<?php echo esc_attr( $cat_name_weight ); ?>; color:<?php echo esc_attr( $cat_name_color ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-count { font-size:<?php echo esc_attr( $count_size ); ?>px; color:<?php echo esc_attr( $count_color ); ?>; margin-left:4px; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-product-count { font-size:<?php echo esc_attr( $count_size ); ?>px; color:<?php echo esc_attr( $count_color ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-cat-desc { font-size:<?php echo esc_attr( $desc_size ); ?>px; color:<?php echo esc_attr( $desc_color ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-shop-now { display:inline-block; padding:8px 18px; background:<?php echo esc_attr( $shop_bg ); ?>; color:<?php echo esc_attr( $shop_color ); ?>; border-radius:<?php echo esc_attr( $shop_radius ); ?>px; text-decoration:none; font-weight:600; transition:background 0.2s ease; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-shop-now:hover { background:<?php echo esc_attr( $shop_hvr ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-nav-btn { width:<?php echo esc_attr( $nav_size + 18 ); ?>px; height:<?php echo esc_attr( $nav_size + 18 ); ?>px; color:<?php echo esc_attr( $nav_color ); ?>; background:<?php echo esc_attr( $nav_bg ); ?>; border:1px solid <?php echo esc_attr( $nav_border ); ?>; border-radius:<?php echo esc_attr( $nav_radius ); ?>px; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-nav-btn:hover { color:<?php echo esc_attr( $nav_hvr_c ); ?>; background:<?php echo esc_attr( $nav_hvr_bg ); ?>; border-color:<?php echo esc_attr( $nav_hvr_bdr ); ?>; }
<?php if ( $show_pager ) : ?>
#<?php echo esc_attr( $uid ); ?> .swiper-pagination-bullet { background:<?php echo esc_attr( $pager_color ); ?>; opacity:0.5; }
#<?php echo esc_attr( $uid ); ?> .swiper-pagination-bullet-active { background:<?php echo esc_attr( $pager_active ); ?>; opacity:1; }
#<?php echo esc_attr( $uid ); ?> .swiper-pagination-progressbar .swiper-pagination-progressbar-fill { background:<?php echo esc_attr( $pager_active ); ?>; }
<?php endif; ?>
</style>
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }

    // ── Swiper init script ────────────────────────────────────────────────────────

    private function inline_script(): void {
        $uid = $this->uid;
        $cfg = wp_json_encode( $this->swiper_config() );
        ?>
<script>
(function () {
    'use strict';
    function ckCslInit() {
        var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
        if (!wrap || typeof Swiper === 'undefined') return;
        var el = wrap.querySelector('.ck-csl-swiper');
        if (!el) return;
        new Swiper(el, <?php echo $cfg; // phpcs:ignore ?>);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ckCslInit);
    } else {
        ckCslInit();
    }
    window.addEventListener('load', function () {
        var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
        if (!wrap) return;
        var el = wrap.querySelector('.ck-csl-swiper');
        if (el && !el.classList.contains('swiper-initialized')) ckCslInit();
    });
})();
</script>
        <?php
    }

    // ── Swiper JS config ──────────────────────────────────────────────────────────

    private function swiper_config(): array {
        $a   = $this->a;
        $uid = $this->uid;

        $col_l = max( 1, intval( $a['colLarge']   ?? 4 ) );
        $col_d = max( 1, intval( $a['colDesktop'] ?? 3 ) );
        $col_p = max( 1, intval( $a['colLaptop']  ?? 2 ) );
        $col_t = max( 1, intval( $a['colTablet']  ?? 2 ) );
        $col_m = max( 1, intval( $a['colMobile']  ?? 1 ) );

        if ( ( $a['layout'] ?? 'carousel' ) === 'slider' ) {
            $col_l = $col_d = $col_p = $col_t = $col_m = 1;
        }

        $scroll     = max( 1, intval( $a['slidesToScroll'] ?? 1 ) );
        $autoplay   = isset( $a['autoplay'] ) ? (bool) $a['autoplay'] : true;
        $show_nav   = isset( $a['showNavigation'] ) ? (bool) $a['showNavigation'] : true;
        $show_pager = ! empty( $a['showSliderPagination'] );
        $pager_type = $a['sliderPaginationType'] ?? 'bullets';
        $rtl        = ! empty( $a['rtlDirection'] );

        return [
            'slidesPerView'  => $col_m,
            'spaceBetween'   => intval( $a['spaceBetween'] ?? 20 ),
            'speed'          => intval( $a['scrollSpeed']  ?? 600 ),
            'loop'           => isset( $a['infiniteLoop'] ) ? (bool) $a['infiniteLoop'] : true,
            'effect'         => $a['slideEffect']          ?? 'slide',
            'dir'            => $rtl ? 'rtl' : 'ltr',
            'grabCursor'     => isset( $a['mouseDraggable'] ) ? (bool) $a['mouseDraggable'] : true,
            'allowTouchMove' => isset( $a['touchSwipe'] ) ? (bool) $a['touchSwipe'] : true,
            'freeMode'       => ! empty( $a['freeMode'] ),
            'mousewheel'     => ! empty( $a['mousewheelControl'] ) ? [ 'forceToAxis' => true ] : false,
            'autoHeight'     => ! empty( $a['adaptiveHeight'] ),
            'autoplay'       => $autoplay
                ? [ 'delay' => intval( $a['autoplaySpeed'] ?? 3000 ), 'disableOnInteraction' => false,
                    'pauseOnMouseEnter' => isset( $a['pauseOnHover'] ) ? (bool) $a['pauseOnHover'] : true ]
                : false,
            'navigation'     => $show_nav
                ? [ 'nextEl' => '#' . $uid . ' .ck-csl-next', 'prevEl' => '#' . $uid . ' .ck-csl-prev' ]
                : false,
            'pagination'     => $show_pager
                ? [ 'el' => '#' . $uid . ' .ck-csl-pager',
                    'type' => 'fraction' === $pager_type ? 'fraction' : ( 'progressbar' === $pager_type ? 'progressbar' : 'bullets' ),
                    'clickable' => true, 'dynamicBullets' => 'dynamic' === $pager_type ]
                : false,
            'breakpoints'    => [
                '480'  => [ 'slidesPerView' => $col_t, 'slidesPerGroup' => $scroll ],
                '768'  => [ 'slidesPerView' => $col_p, 'slidesPerGroup' => $scroll ],
                '1024' => [ 'slidesPerView' => $col_d, 'slidesPerGroup' => $scroll ],
                '1280' => [ 'slidesPerView' => $col_l, 'slidesPerGroup' => $scroll ],
            ],
        ];
    }

    // ── Small helpers

    private function thumb_br(): string {
        $shape  = $this->a['thumbnailShape']  ?? 'square';
        $radius = intval( $this->a['thumbnailRadius'] ?? 0 );
        if ( 'rounded' === $shape ) return '8px';
        if ( 'circle'  === $shape ) return '50%';
        return $radius > 0 ? "{$radius}px" : '0px';
    }

    private function shadow_css(): string {
        if ( empty( $this->a['showBoxShadow'] ) ) return 'none';
        $a = $this->a;
        return intval( $a['boxShadowH'] ?? 0 ) . 'px '
             . intval( $a['boxShadowV'] ?? 4 ) . 'px '
             . intval( $a['boxShadowBlur'] ?? 15 ) . 'px '
             . intval( $a['boxShadowSpread'] ?? 0 ) . 'px '
             . ( $a['boxShadowColor'] ?? 'rgba(0,0,0,0.15)' );
    }

    private function border_css(): string {
        if ( empty( $this->a['showThumbBorder'] ) ) return 'none';
        $a = $this->a;
        return intval( $a['thumbBorderWidth'] ?? 1 ) . 'px '
             . ( $a['thumbBorderStyle'] ?? 'solid' ) . ' '
             . ( $a['thumbBorderColor'] ?? '#dddddd' );
    }

    private function nav_svgs(): array {
        $style = min( 3, max( 1, intval( $this->a['navIconStyle'] ?? 1 ) ) );
        $icons = [
            1 => [ '<polyline points="15 18 9 12 15 6"/>',
                   '<polyline points="9 18 15 12 9 6"/>' ],
            2 => [ '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
                   '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>' ],
            3 => [ '<circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/>',
                   '<circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/>' ],
        ];
        return $icons[ $style ];
    }
}
