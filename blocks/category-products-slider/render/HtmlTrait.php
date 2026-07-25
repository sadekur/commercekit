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
            $nav_wrap_cls = 'ck-csl-nav-wrap ck-csl-nav-' . $nav_pos . ' absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10 ' . $px_cls . ( $rtl ? ' flex-row-reverse' : '' );
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

        $wrap_cls    = 'ck-csl-wrap relative w-full' . ( $rtl ? ' ck-csl-rtl' : '' ) . ( $show_pager ? ' ck-csl-has-pager' : '' ) . ( $preloader ? ' ck-csl-preloader' : '' );
        $outer_cls   = 'ck-csl-outer relative' . ( $show_nav ? ' ck-has-nav' : '' );
        $nav_btn_cls = 'ck-csl-nav-btn flex items-center justify-center cursor-pointer pointer-events-auto transition-[background,color,border-color] duration-200 shrink-0 focus:outline focus:outline-2 focus:outline-[#0073aa] focus:outline-offset-2';
        $swiper_cls  = 'swiper ck-csl-swiper overflow-hidden' . ( $show_pager ? ' pb-10' : '' ) . $this->carousel_style_class() . $this->slider_style_class();
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
                dir="<?php echo $rtl ? 'rtl' : 'ltr'; ?>">

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

        $pagination_type = $a['gridPaginationType'] ?? 'none';
        $paginate    = ( 'grid' === $layout ) && in_array( $pagination_type, [ 'load-more', 'numbered' ], true );
        $per_page    = max( 1, intval( $a['gridItemsPerPage'] ?? 6 ) );
        $total_pages = $paginate ? max( 1, (int) ceil( count( $terms ) / $per_page ) ) : 1;
        $grid_terms  = ( $paginate && $total_pages > 1 ) ? array_slice( $terms, 0, $per_page ) : $terms;
        $paginate    = $paginate && $total_pages > 1;
        $this->paginated = $paginate;

        ob_start();
        ?>
            <div id="<?php echo esc_attr( $uid ); ?>"
                class="ck-csl-wrap ck-csl-layout-<?php echo esc_attr( $layout ); ?> w-full<?php echo $preloader ? ' ck-csl-preloader' : ''; ?>"
                <?php if ( $paginate ) : ?>
                data-ck-csl-pagination="<?php echo esc_attr( $pagination_type ); ?>"
                data-ck-csl-page="1"
                data-ck-csl-total-pages="<?php echo esc_attr( $total_pages ); ?>"
                data-ck-csl-atts="<?php echo esc_attr( wp_json_encode( $this->grid_ajax_atts() ) ); ?>"
                <?php endif; ?>
            >

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
                    <?php foreach ( $grid_terms as $term ) :
                        if ( ! ( $term instanceof WP_Term ) ) continue; ?>
                        <div class="ck-csl-grid-item">
                            <?php $this->render_item( $term, $ctx ); ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php if ( $paginate ) :
                    if ( 'load-more' === $pagination_type ) {
                        $this->render_load_more_button( count( $grid_terms ), count( $terms ) );
                    } else {
                        $this->render_numbered_pager( 1, $total_pages );
                    }
                endif; ?>
                <?php endif; ?>

            </div><!-- .ck-csl-wrap -->
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }

    /**
     * Only the ~35 attributes that affect querying/rendering a grid page — sent to
     * the front-end as JSON so the AJAX pagination endpoint can rebuild the exact
     * same term list without round-tripping every block attribute.
     */
    private function grid_ajax_atts(): array {
        $keys = [
            'categoryType', 'hideEmpty', 'totalCategories', 'randomize', 'orderBy', 'order',
            'filterType', 'specificCategories', 'hideCatWithoutThumb', 'parentChildCategories',
            'excludeParent', 'excludeChild', 'excludeGrandChild', 'excludeGreatGrandChild',
            'gridItemsPerPage',
            'contentPosition', 'equalHeight', 'contentPadTop', 'contentPadRight', 'contentPadBottom', 'contentPadLeft',
            'thumbnailImgSize', 'showThumbnail', 'useCustomPlaceholder', 'customPlaceholderUrl', 'imageMode',
            'showCatName', 'showProductCount', 'productCountPos', 'productCountBefore', 'productCountAfter',
            'showDescription', 'showCustomText', 'customText', 'catNameMarginTop', 'descMarginTop',
            'showShopNow', 'shopNowLabel', 'shopNowAlignment', 'shopNowTarget', 'shopNowMarginTop',
        ];
        return array_intersect_key( $this->a, array_flip( $keys ) );
    }

    private function render_load_more_button(): void {
        ?>
        <div class="ck-csl-load-more-wrap">
            <button type="button" class="ck-csl-load-more"><?php esc_html_e( 'Load More', 'commerce-kit' ); ?></button>
        </div>
        <?php
    }

    private function render_numbered_pager( int $current, int $total_pages ): void {
        ?>
        <nav class="ck-csl-pagination" role="navigation" aria-label="<?php esc_attr_e( 'Category pagination', 'commerce-kit' ); ?>">
            <button type="button" class="ck-csl-page-btn ck-csl-page-first" data-page="1" aria-label="<?php esc_attr_e( 'First page', 'commerce-kit' ); ?>" <?php disabled( $current <= 1 ); ?>>«</button>
            <button type="button" class="ck-csl-page-btn ck-csl-page-prev" data-page="<?php echo esc_attr( max( 1, $current - 1 ) ); ?>" aria-label="<?php esc_attr_e( 'Previous page', 'commerce-kit' ); ?>" <?php disabled( $current <= 1 ); ?>>‹</button>
            <?php foreach ( $this->paginate_numbers( $current, $total_pages ) as $num ) :
                if ( '...' === $num ) : ?>
                    <span class="ck-csl-page-ellipsis">…</span>
                <?php else : ?>
                    <button type="button" class="ck-csl-page-btn ck-csl-page-num<?php echo $num === $current ? ' is-active' : ''; ?>" data-page="<?php echo esc_attr( $num ); ?>"><?php echo esc_html( $num ); ?></button>
                <?php endif;
            endforeach; ?>
            <button type="button" class="ck-csl-page-btn ck-csl-page-next" data-page="<?php echo esc_attr( min( $total_pages, $current + 1 ) ); ?>" aria-label="<?php esc_attr_e( 'Next page', 'commerce-kit' ); ?>" <?php disabled( $current >= $total_pages ); ?>>›</button>
            <button type="button" class="ck-csl-page-btn ck-csl-page-last" data-page="<?php echo esc_attr( $total_pages ); ?>" aria-label="<?php esc_attr_e( 'Last page', 'commerce-kit' ); ?>" <?php disabled( $current >= $total_pages ); ?>>»</button>
        </nav>
        <?php
    }

    /**
     * Renders a single grid page of items as an HTML fragment — called by the
     * public REST endpoint for every page after the first (which is server-rendered
     * inline by html_static() above).
     */
    public function render_grid_page( int $page ): array {
        ob_start();
        $terms = $this->get_terms();
        ob_end_clean(); // discard any "no categories found" notice; empty state is conveyed via the return value instead

        $terms       = is_array( $terms ) ? $terms : [];
        $per_page    = max( 1, intval( $this->a['gridItemsPerPage'] ?? 6 ) );
        $total_items = count( $terms );
        $total_pages = max( 1, (int) ceil( $total_items / $per_page ) );
        $page        = max( 1, min( $page, $total_pages ) );

        $slice = array_slice( $terms, ( $page - 1 ) * $per_page, $per_page );
        $ctx   = $this->item_context();

        ob_start();
        foreach ( $slice as $term ) :
            if ( ! ( $term instanceof WP_Term ) ) continue;
            ?>
            <div class="ck-csl-grid-item">
                <?php $this->render_item( $term, $ctx ); ?>
            </div>
            <?php
        endforeach;
        $html = ob_get_clean();

        return [
            'html'       => $html,
            'page'       => $page,
            'totalPages' => $total_pages,
            'totalItems' => $total_items,
        ];
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
            $nav_wrap_cls = 'ck-csl-nav-wrap ck-csl-nav-' . $nav_pos . ' absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10 ' . $px_cls . ( $rtl ? ' flex-row-reverse' : '' );
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

        $wrap_cls    = 'ck-csl-wrap relative w-full' . ( $rtl ? ' ck-csl-rtl' : '' ) . ( $show_pager ? ' ck-csl-has-pager' : '' ) . ( $preloader ? ' ck-csl-preloader' : '' );
        $outer_cls   = 'ck-csl-outer relative' . ( $show_nav ? ' ck-has-nav' : '' );
        $nav_btn_cls = 'ck-csl-nav-btn flex items-center justify-center cursor-pointer pointer-events-auto transition-[background,color,border-color] duration-200 shrink-0 focus:outline focus:outline-2 focus:outline-[#0073aa] focus:outline-offset-2';
        $swiper_cls  = 'swiper ck-csl-swiper overflow-hidden' . ( $show_pager ? ' pb-10' : '' ) . $this->carousel_style_class() . $this->slider_style_class();

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
            <div id="<?php echo esc_attr( $uid ); ?>" class="<?php echo esc_attr( $wrap_cls ); ?>" dir="<?php echo $rtl ? 'rtl' : 'ltr'; ?>">
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
