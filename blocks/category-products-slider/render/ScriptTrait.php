<?php
trait CslScriptTrait {

    private function inline_script(): void {
        $uid        = $this->uid;
        $a          = $this->a;
        $cfg        = wp_json_encode( $this->swiper_config() );
        $preloader  = isset( $a['preloader'] ) ? (bool) $a['preloader'] : true;
        $show_pager = ! empty( $a['showSliderPagination'] );
        $pager_type = $a['sliderPaginationType'] ?? 'bullets';
        ?>
        <script>
        (function () {
            'use strict';
            function ckCslReveal() {
                var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
                if (!wrap) return;
                wrap.classList.remove('ck-csl-preloader');
                wrap.classList.add('ck-csl-ready');
            }
            function ckCslInit() {
                var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
                if (!wrap || typeof Swiper === 'undefined') return;
                var el = wrap.querySelector('.ck-csl-swiper');
                if (!el) return;
                var cfg = <?php echo $cfg; // phpcs:ignore ?>;
                <?php if ( $show_pager && 'numbered' === $pager_type ) : ?>
                cfg.pagination.renderBullet = function(i, c) {
                    return '<span class="' + c + ' ck-csl-pager-num">' + (i + 1) + '</span>';
                };
                <?php endif; ?>
                new Swiper(el, cfg);
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
                <?php if ( $preloader ) : ?>ckCslReveal();<?php endif; ?>
            });
        })();
        </script>
        <?php
    }

    private function inline_script_static(): void {
        $uid       = $this->uid;
        $preloader = isset( $this->a['preloader'] ) ? (bool) $this->a['preloader'] : true;
        if ( ! $preloader ) return;
        ?>
        <script>
        (function () {
            'use strict';
            function ckCslReveal() {
                var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
                if (!wrap) return;
                wrap.classList.remove('ck-csl-preloader');
                wrap.classList.add('ck-csl-ready');
            }
            if (document.readyState === 'complete') {
                ckCslReveal();
            } else {
                window.addEventListener('load', ckCslReveal);
            }
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
        $style      = $this->carousel_style();
        $sld_style  = $this->slider_style();

        $config = [
            'slidesPerView'  => $col_m,
            'spaceBetween'   => intval( $a['spaceBetween'] ?? 20 ),
            'speed'          => intval( $a['scrollSpeed']  ?? 600 ),
            'loop'           => isset( $a['infiniteLoop'] ) ? (bool) $a['infiniteLoop'] : true,
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

        if ( 'ticker' === $style ) {
            // Continuous, non-stop scroll: freeMode + loop + a 1ms autoplay delay
            // keeps Swiper perpetually advancing instead of snapping between slides.
            $config['freeMode']  = [ 'enabled' => true, 'momentum' => false ];
            $config['loop']      = true;
            $config['speed']     = max( 1000, intval( $a['scrollSpeed'] ?? 600 ) ) * 8;
            $config['autoplay']  = [
                'delay'                => 1,
                'disableOnInteraction' => false,
                'pauseOnMouseEnter'    => isset( $a['pauseOnHover'] ) ? (bool) $a['pauseOnHover'] : true,
            ];
        } elseif ( 'fade' === $style ) {
            // Fade only supports a single visible slide, so force 1-up at every breakpoint.
            $config['effect']        = 'fade';
            $config['fadeEffect']    = [ 'crossFade' => true ];
            $config['freeMode']      = false;
            $config['slidesPerView'] = 1;
            $config['breakpoints']   = [
                '480'  => [ 'slidesPerView' => 1, 'slidesPerGroup' => 1 ],
                '768'  => [ 'slidesPerView' => 1, 'slidesPerGroup' => 1 ],
                '1024' => [ 'slidesPerView' => 1, 'slidesPerGroup' => 1 ],
                '1280' => [ 'slidesPerView' => 1, 'slidesPerGroup' => 1 ],
            ];
        }

        return $config;
    }
}
