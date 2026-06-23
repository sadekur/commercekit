<?php
trait CslHtmlTrait {

    private function html_slider( array $terms ): void {
        $a   = $this->a;
        $uid = $this->uid;
        $ctx = $this->item_context();

        $rtl        = ! empty( $a['rtlDirection'] );
        $show_pager = ! empty( $a['showSliderPagination'] );
        $show_nav   = isset( $a['showNavigation'] ) ? (bool) $a['showNavigation'] : true;
        $equal_h    = $ctx['equal_h'];
        $show_title = isset( $a['showSectionTitle'] ) ? (bool) $a['showSectionTitle'] : true;
        $title_text = sanitize_text_field( $a['sectionTitleText'] ?? 'Category Showcase' );
        $nav_size   = intval( $a['navIconSize'] ?? 22 );
        $preloader  = isset( $a['preloader'] ) ? (bool) $a['preloader'] : true;

        [ $svg_prev, $svg_next ] = $this->nav_svgs();

        $nav_pos     = $a['navPosition'] ?? 'top-right';
        $is_vertical = in_array( $nav_pos, [ 'vertical-inner', 'vertical-outer', 'vertical-center' ], true );
        $is_bottom   = str_starts_with( $nav_pos, 'bottom' );

        if ( $is_vertical ) {
            $px_cls       = 'vertical-outer' === $nav_pos ? '' : 'px-1.5';
            $nav_wrap_cls = 'ck-csl-nav-wrap ck-csl-nav-' . $nav_pos . ' absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10 ' . $px_cls . ( $rtl ? '' : ' flex-row-reverse' );
        } else {
            if ( 'top-left' === $nav_pos || 'bottom-left' === $nav_pos ) {
                $nav_align = 'justify-start';
            } elseif ( 'top-center' === $nav_pos || 'bottom-center' === $nav_pos ) {
                $nav_align = 'justify-center';
            } else {
                $nav_align = 'justify-end';
            }
            $nav_wrap_cls = 'ck-csl-nav-wrap ck-csl-nav-' . $nav_pos . ' flex ' . $nav_align . ' gap-2 pointer-events-none z-10';
        }

        $wrap_cls    = 'ck-csl-wrap relative w-full' . ( $rtl ? '' : ' ck-csl-rtl' ) . ( $show_pager ? ' ck-csl-has-pager' : '' ) . ( $preloader ? ' ck-csl-preloader' : '' );
        $outer_cls   = 'ck-csl-outer relative' . ( $show_nav ? ' ck-has-nav' : '' );
        $nav_btn_cls = 'ck-csl-nav-btn flex items-center justify-center cursor-pointer pointer-events-auto transition-[background,color,border-color] duration-200 shrink-0 focus:outline focus:outline-2 focus:outline-[#0073aa] focus:outline-offset-2';
        $swiper_cls  = 'swiper ck-csl-swiper overflow-hidden' . ( $show_pager ? ' pb-10' : '' );
        $slide_cls   = 'swiper-slide ck-csl-slide box-border' . ( $equal_h ? ' h-full' : '' );

        // Capture nav HTML for conditional placement (top vs bottom)
        ob_start();
        if ( $show_nav ) : ?>
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
        <?php endif;
        $nav_html = ob_get_clean();

        ob_start();
        ?>
            <div id="<?php echo esc_attr( $uid ); ?>"
                class="<?php echo esc_attr( $wrap_cls ); ?>"
                dir="<?php echo $rtl ? 'ltr' : 'rtl'; ?>">

                <?php if ( $show_title && $title_text ) : ?>
                    <h3 class="ck-csl-section-title text-[22px] font-bold text-[#222] m-0 mb-5 leading-[1.3]"><?php echo esc_html( $title_text ); ?></h3>
                <?php endif; ?>

                <div class="<?php echo esc_attr( $outer_cls ); ?>">

                    <?php if ( ! $is_bottom ) echo $nav_html; // phpcs:ignore — top & vertical positions ?>

                    <div class="<?php echo esc_attr( $swiper_cls ); ?>">
                        <div class="swiper-wrapper">
                            <?php foreach ( $terms as $term ) :
                                if ( ! ( $term instanceof WP_Term ) ) continue;
                                ?>
                                <div class="<?php echo esc_attr( $slide_cls ); ?>">
                                    <?php $this->render_item( $term, $ctx ); ?>
                                </div>
                            <?php endforeach; ?>
                        </div><!-- .swiper-wrapper -->

                        <?php if ( $show_pager ) : ?>
                        <div class="ck-csl-pager swiper-pagination text-center mt-[18px] !static"></div>
                        <?php endif; ?>
                    </div><!-- .swiper -->

                    <?php if ( $is_bottom ) echo $nav_html; // phpcs:ignore — bottom positions ?>

                </div><!-- .ck-csl-outer -->
            </div><!-- .ck-csl-wrap -->
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }

    private function html_static( array $terms, string $layout ): void {
        $a   = $this->a;
        $uid = $this->uid;
        $ctx = $this->item_context();

        $show_title = isset( $a['showSectionTitle'] ) ? (bool) $a['showSectionTitle'] : true;
        $title_text = sanitize_text_field( $a['sectionTitleText'] ?? 'Category Showcase' );
        $preloader  = isset( $a['preloader'] ) ? (bool) $a['preloader'] : true;

        ob_start();
        ?>
            <div id="<?php echo esc_attr( $uid ); ?>" class="ck-csl-wrap ck-csl-layout-<?php echo esc_attr( $layout ); ?> w-full<?php echo $preloader ? ' ck-csl-preloader' : ''; ?>">

                <?php if ( $show_title && $title_text ) : ?>
                    <h3 class="ck-csl-section-title text-[22px] font-bold text-[#222] m-0 mb-5 leading-[1.3]"><?php echo esc_html( $title_text ); ?></h3>
                <?php endif; ?>

                <?php if ( 'inline' === $layout ) : ?>
                <div class="ck-csl-inline-wrap" style="display:flex;flex-wrap:nowrap;gap:<?php echo intval( $a['spaceBetween'] ?? 20 ); ?>px;overflow-x:auto;-webkit-overflow-scrolling:touch;">
                    <?php foreach ( $terms as $term ) :
                        if ( ! ( $term instanceof WP_Term ) ) continue; ?>
                        <div class="ck-csl-inline-item" style="flex:0 0 220px;min-width:0;">
                            <?php $this->render_item( $term, $ctx ); ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php else : /* grid */ ?>
                <div class="ck-csl-grid-wrap">
                    <?php foreach ( $terms as $term ) :
                        if ( ! ( $term instanceof WP_Term ) ) continue; ?>
                        <div class="ck-csl-grid-item">
                            <?php $this->render_item( $term, $ctx ); ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>

            </div><!-- .ck-csl-wrap -->
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }

    private function html_cup_slider( array $groups ): void {
        $a   = $this->a;
        $uid = $this->uid;

        $rtl        = ! empty( $a['rtlDirection'] );
        $show_pager = ! empty( $a['showSliderPagination'] );
        $show_nav   = isset( $a['showNavigation'] ) ? (bool) $a['showNavigation'] : true;
        $show_title = isset( $a['showSectionTitle'] ) ? (bool) $a['showSectionTitle'] : true;
        $title_text = sanitize_text_field( $a['sectionTitleText'] ?? 'Category Showcase' );
        $nav_size   = intval( $a['navIconSize'] ?? 22 );
        $preloader  = isset( $a['preloader'] ) ? (bool) $a['preloader'] : true;

        [ $svg_prev, $svg_next ] = $this->nav_svgs();

        $nav_pos     = $a['navPosition'] ?? 'top-right';
        $is_vertical = in_array( $nav_pos, [ 'vertical-inner', 'vertical-outer', 'vertical-center' ], true );
        $is_bottom   = str_starts_with( $nav_pos, 'bottom' );

        if ( $is_vertical ) {
            $px_cls       = 'vertical-outer' === $nav_pos ? '' : 'px-1.5';
            $nav_wrap_cls = 'ck-csl-nav-wrap ck-csl-nav-' . $nav_pos . ' absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10 ' . $px_cls . ( $rtl ? '' : ' flex-row-reverse' );
        } else {
            if ( 'top-left' === $nav_pos || 'bottom-left' === $nav_pos ) {
                $nav_align = 'justify-start';
            } elseif ( 'top-center' === $nav_pos || 'bottom-center' === $nav_pos ) {
                $nav_align = 'justify-center';
            } else {
                $nav_align = 'justify-end';
            }
            $nav_wrap_cls = 'ck-csl-nav-wrap ck-csl-nav-' . $nav_pos . ' flex ' . $nav_align . ' gap-2 pointer-events-none z-10';
        }

        $wrap_cls    = 'ck-csl-wrap relative w-full' . ( $rtl ? '' : ' ck-csl-rtl' ) . ( $show_pager ? ' ck-csl-has-pager' : '' ) . ( $preloader ? ' ck-csl-preloader' : '' );
        $outer_cls   = 'ck-csl-outer relative' . ( $show_nav ? ' ck-has-nav' : '' );
        $nav_btn_cls = 'ck-csl-nav-btn flex items-center justify-center cursor-pointer pointer-events-auto transition-[background,color,border-color] duration-200 shrink-0 focus:outline focus:outline-2 focus:outline-[#0073aa] focus:outline-offset-2';
        $swiper_cls  = 'swiper ck-csl-swiper overflow-hidden' . ( $show_pager ? ' pb-10' : '' );

        ob_start();
        if ( $show_nav ) : ?>
        <div class="<?php echo esc_attr( $nav_wrap_cls ); ?>">
            <div class="ck-csl-prev <?php echo esc_attr( $nav_btn_cls ); ?>" role="button" aria-label="<?php esc_attr_e( 'Previous', 'commerce-kit' ); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="<?php echo esc_attr( $nav_size ); ?>" height="<?php echo esc_attr( $nav_size ); ?>" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><?php echo $svg_prev; // phpcs:ignore ?></svg>
            </div>
            <div class="ck-csl-next <?php echo esc_attr( $nav_btn_cls ); ?>" role="button" aria-label="<?php esc_attr_e( 'Next', 'commerce-kit' ); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="<?php echo esc_attr( $nav_size ); ?>" height="<?php echo esc_attr( $nav_size ); ?>" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><?php echo $svg_next; // phpcs:ignore ?></svg>
            </div>
        </div>
        <?php endif;
        $nav_html = ob_get_clean();

        ob_start();
        ?>
            <div id="<?php echo esc_attr( $uid ); ?>" class="<?php echo esc_attr( $wrap_cls ); ?>" dir="<?php echo $rtl ? 'ltr' : 'rtl'; ?>">
                <?php if ( $show_title && $title_text ) : ?>
                    <h3 class="ck-csl-section-title text-[22px] font-bold text-[#222] m-0 mb-5 leading-[1.3]"><?php echo esc_html( $title_text ); ?></h3>
                <?php endif; ?>
                <div class="<?php echo esc_attr( $outer_cls ); ?>">
                    <?php if ( ! $is_bottom ) echo $nav_html; // phpcs:ignore — top & vertical positions ?>
                    <div class="<?php echo esc_attr( $swiper_cls ); ?>">
                        <div class="swiper-wrapper">
                            <?php foreach ( $groups as $group ) : ?>
                            <div class="swiper-slide ck-csl-slide box-border border">
                                <?php $this->render_cup_group( $group ); ?>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php if ( $show_pager ) : ?>
                        <div class="ck-csl-pager swiper-pagination text-center mt-[18px] !static"></div>
                        <?php endif; ?>
                    </div>
                    <?php if ( $is_bottom ) echo $nav_html; // phpcs:ignore — bottom positions ?>
                </div>
            </div>
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }

    private function html_cup_static( array $groups, string $layout ): void {
        $a   = $this->a;
        $uid = $this->uid;

        $show_title = isset( $a['showSectionTitle'] ) ? (bool) $a['showSectionTitle'] : true;
        $title_text = sanitize_text_field( $a['sectionTitleText'] ?? 'Category Showcase' );
        $preloader  = isset( $a['preloader'] ) ? (bool) $a['preloader'] : true;

        ob_start();
        ?>
            <div id="<?php echo esc_attr( $uid ); ?>" class="ck-csl-wrap ck-csl-layout-<?php echo esc_attr( $layout ); ?> w-full<?php echo $preloader ? ' ck-csl-preloader' : ''; ?>">
                <?php if ( $show_title && $title_text ) : ?>
                    <h3 class="ck-csl-section-title text-[22px] font-bold text-[#222] m-0 mb-5 leading-[1.3]"><?php echo esc_html( $title_text ); ?></h3>
                <?php endif; ?>
                <?php if ( 'inline' === $layout ) : ?>
                <div class="ck-csl-inline-wrap" style="display:flex;flex-wrap:nowrap;gap:<?php echo intval( $a['spaceBetween'] ?? 20 ); ?>px;overflow-x:auto;-webkit-overflow-scrolling:touch;">
                    <?php foreach ( $groups as $group ) : ?>
                    <div class="ck-csl-inline-item" style="flex:0 0 220px;min-width:0;">
                        <?php $this->render_cup_group( $group ); ?>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php else : ?>
                <div class="ck-csl-grid-wrap">
                    <?php foreach ( $groups as $group ) : ?>
                    <div class="ck-csl-grid-item">
                        <?php $this->render_cup_group( $group ); ?>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }
}
