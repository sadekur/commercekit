<?php
trait CslStylesTrait {

    private function inline_styles(): void {
        $a   = $this->a;
        $uid = $this->uid;

        $thumb_zoom         = $a['thumbnailZoom']    ?? 'none';
        $image_mode         = $a['imageMode']        ?? 'normal';
        $image_custom_color = $a['imageCustomColor'] ?? '#cc0000';

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
        $custom_text_color = $a['customTextColor']         ?? '#555555';
        $thumb_pad       = intval( $a['thumbInnerPad']     ?? 0 );
        $thumb_mb        = intval( $a['thumbMarginBottom'] ?? 0 );

        $shop_bg     = $a['shopNowBgColor']      ?? '#cc2b5e';
        $shop_hvr    = $a['shopNowHoverBg']      ?? '#a02049';
        $shop_color  = $a['shopNowTextColor']    ?? '#ffffff';
        $shop_radius = intval( $a['shopNowBorderRadius'] ?? 3 );

        $nav_size    = intval( $a['navIconSize']     ?? 22 );
        $nav_color   = $a['navColor']                ?? '#333333';
        $nav_hvr_c   = $a['navHoverColor']           ?? '#ffffff';
        $nav_bg      = $a['navBgColor']              ?? '#ffffff';
        $nav_hvr_bg  = $a['navHoverBgColor']         ?? '#cc2b5e';
        $nav_border  = $a['navBorderColor']          ?? '#dddddd';
        $nav_hvr_bdr = $a['navHoverBorderColor']     ?? '#cc2b5e';
        $nav_radius  = intval( $a['navBorderRadius'] ?? 50 );

        $nav_hide_mobile = ! empty( $a['navHideOnMobile'] );
        $nav_pos         = $a['navPosition'] ?? 'top-right';
        $nav_is_vertical = in_array( $nav_pos, [ 'vertical-inner', 'vertical-outer', 'vertical-center' ], true );

        $show_pager   = ! empty( $a['showSliderPagination'] );
        $pager_color  = $a['paginationColor']       ?? '#cc2b5e';
        $pager_active = $a['paginationActiveColor'] ?? '#333333';

        $layout = $a['layout'] ?? 'carousel';
        $col_l  = max( 1, intval( $a['colLarge']   ?? 4 ) );
        $col_d  = max( 1, intval( $a['colDesktop'] ?? 3 ) );
        $col_p  = max( 1, intval( $a['colLaptop']  ?? 2 ) );
        $col_t  = max( 1, intval( $a['colTablet']  ?? 2 ) );
        $col_m  = max( 1, intval( $a['colMobile']  ?? 1 ) );
        $gap    = intval( $a['spaceBetween'] ?? 20 );

        $preloader = isset( $a['preloader'] ) ? (bool) $a['preloader'] : true;

        ob_start();
        ?>
        <style id="<?php echo esc_attr( $uid ); ?>-css">
            <?php if ( $preloader ) : ?>
            #<?php echo esc_attr( $uid ); ?>.ck-csl-preloader { opacity: 0; transition: opacity 0.5s ease; }
            #<?php echo esc_attr( $uid ); ?>.ck-csl-ready { opacity: 1; }
            <?php endif; ?>
            <?php if ( 'grid' === $layout ) : ?>
                #<?php echo esc_attr( $uid ); ?> .ck-csl-grid-wrap { display:grid; gap:<?php echo esc_attr( $gap ); ?>px; grid-template-columns:repeat(<?php echo esc_attr( $col_m ); ?>,1fr); }
                @media(min-width:480px){ #<?php echo esc_attr( $uid ); ?> .ck-csl-grid-wrap { grid-template-columns:repeat(<?php echo esc_attr( $col_t ); ?>,1fr); } }
                @media(min-width:768px){ #<?php echo esc_attr( $uid ); ?> .ck-csl-grid-wrap { grid-template-columns:repeat(<?php echo esc_attr( $col_p ); ?>,1fr); } }
                @media(min-width:1024px){ #<?php echo esc_attr( $uid ); ?> .ck-csl-grid-wrap { grid-template-columns:repeat(<?php echo esc_attr( $col_d ); ?>,1fr); } }
                @media(min-width:1280px){ #<?php echo esc_attr( $uid ); ?> .ck-csl-grid-wrap { grid-template-columns:repeat(<?php echo esc_attr( $col_l ); ?>,1fr); } }
                #<?php echo esc_attr( $uid ); ?> .ck-csl-grid-item { min-width:0; }
            <?php endif; ?>
            /* ── "Above thumbnail" layout fix ──
             * Without this, details (flex-1) swallowed all remaining height,
             * pushing the thumbnail to different Y positions per card.
             * Solution: details shrinks to content; thumb-wrap fills the rest.
             * CSS order swaps visual position without changing DOM order. */
            #<?php echo esc_attr( $uid ); ?> .ck-csl-pos-above .ck-csl-details    { order: 1; flex: 0 0 auto; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-pos-above .ck-csl-thumb-wrap { order: 2; flex: 1 1 auto; min-height: 120px; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-pos-above .ck-csl-thumb      { width: 100%; height: 100%; object-fit: cover; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-pos-above .ck-csl-thumb-placeholder { height: 100%; min-height: 160px; }

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
            <?php if ( 'custom_color' === $image_mode ) : ?>
                #<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-color-overlay {
                    position: absolute;
                    inset: 0;
                    background: <?php echo esc_attr( $image_custom_color ); ?>;
                    mix-blend-mode: multiply;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                #<?php echo esc_attr( $uid ); ?> .ck-csl-thumb-wrap:hover .ck-csl-thumb-color-overlay { opacity: 0; }
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
            #<?php echo esc_attr( $uid ); ?> .ck-csl-custom-text { color:<?php echo esc_attr( $custom_text_color ); ?>; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-shop-now { display:inline-block; padding:8px 18px; background:<?php echo esc_attr( $shop_bg ); ?>; color:<?php echo esc_attr( $shop_color ); ?>; border-radius:<?php echo esc_attr( $shop_radius ); ?>px; text-decoration:none; font-weight:600; transition:background 0.2s ease; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-shop-now:hover { background:<?php echo esc_attr( $shop_hvr ); ?>; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-nav-btn { width:<?php echo esc_attr( $nav_size + 18 ); ?>px; height:<?php echo esc_attr( $nav_size + 18 ); ?>px; color:<?php echo esc_attr( $nav_color ); ?>; background:<?php echo esc_attr( $nav_bg ); ?>; border:1px solid <?php echo esc_attr( $nav_border ); ?>; border-radius:<?php echo esc_attr( $nav_radius ); ?>px; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-nav-btn:hover { color:<?php echo esc_attr( $nav_hvr_c ); ?>; background:<?php echo esc_attr( $nav_hvr_bg ); ?>; border-color:<?php echo esc_attr( $nav_hvr_bdr ); ?>; }
            <?php if ( $nav_hide_mobile ) : ?>
            @media (max-width: 767px) { #<?php echo esc_attr( $uid ); ?> .ck-csl-nav-wrap { display: none !important; } }
            <?php endif; ?>
            <?php if ( $show_pager ) : ?>
            #<?php echo esc_attr( $uid ); ?> .swiper-pagination-bullet { background:<?php echo esc_attr( $pager_color ); ?>; opacity:0.5; }
            #<?php echo esc_attr( $uid ); ?> .swiper-pagination-bullet-active { background:<?php echo esc_attr( $pager_active ); ?>; opacity:1; }
            #<?php echo esc_attr( $uid ); ?> .swiper-pagination-progressbar .swiper-pagination-progressbar-fill { background:<?php echo esc_attr( $pager_active ); ?>; }
            <?php endif; ?>
            #<?php echo esc_attr( $uid ); ?> .ck-csl-cup-parent-link { display:inline-block; font-size:<?php echo esc_attr( $cat_name_size ); ?>px; font-weight:<?php echo esc_attr( $cat_name_weight ); ?>; color:<?php echo esc_attr( $cat_name_color ); ?>; transition:opacity 0.2s ease; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-cup-parent-link:hover { opacity:0.75; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-cup-pills { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-cup-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:20px; font-size:12px; font-weight:500; color:#4b5563; text-decoration:none; line-height:1.4; transition:background 0.2s ease,color 0.2s ease,border-color 0.2s ease; white-space:nowrap; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-cup-pill:hover { background:<?php echo esc_attr( $nav_hvr_bg ); ?>; border-color:<?php echo esc_attr( $nav_hvr_bg ); ?>; color:<?php echo esc_attr( $nav_hvr_c ); ?>; }
            #<?php echo esc_attr( $uid ); ?> .ck-csl-cup-pill-count { font-size:11px; opacity:0.65; }
        </style>
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }
}
