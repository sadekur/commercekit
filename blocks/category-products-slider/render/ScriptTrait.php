<?php
trait CslScriptTrait {

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
                ? [ 'delay'              => intval( $a['autoplaySpeed'] ?? 3000 ),
                    'disableOnInteraction' => false,
                    'pauseOnMouseEnter'  => isset( $a['pauseOnHover'] ) ? (bool) $a['pauseOnHover'] : true ]
                : false,
            'navigation'     => $show_nav
                ? [ 'nextEl' => '#' . $uid . ' .ck-csl-next',
                    'prevEl' => '#' . $uid . ' .ck-csl-prev' ]
                : false,
            'pagination'     => $show_pager
                ? [ 'el'            => '#' . $uid . ' .ck-csl-pager',
                    'type'          => 'fraction' === $pager_type ? 'fraction'
                        : ( 'progressbar' === $pager_type ? 'progressbar' : 'bullets' ),
                    'clickable'     => true,
                    'dynamicBullets' => 'dynamic' === $pager_type ]
                : false,
            'breakpoints'    => [
                '480'  => [ 'slidesPerView' => $col_t, 'slidesPerGroup' => $scroll ],
                '768'  => [ 'slidesPerView' => $col_p, 'slidesPerGroup' => $scroll ],
                '1024' => [ 'slidesPerView' => $col_d, 'slidesPerGroup' => $scroll ],
                '1280' => [ 'slidesPerView' => $col_l, 'slidesPerGroup' => $scroll ],
            ],
        ];
    }
}
