<?php
trait CslItemTrait {

    private function item_context(): array {
        $a           = $this->a;
        $content_pos = $a['contentPosition'] ?? 'below';
        $is_overlay  = in_array( $content_pos,
            [ 'overlay', 'overlay_top', 'overlay_middle', 'overlay_bottom', 'overlay_box' ], true );
        $equal_h     = isset( $a['equalHeight'] ) ? (bool) $a['equalHeight'] : true;

        $flex_dir = 'left'  === $content_pos ? 'flex-row-reverse'
                  : ( 'right' === $content_pos ? 'flex-row' : 'flex-col' );
        $item_cls = 'ck-csl-item relative flex ' . $flex_dir . ' bg-white rounded overflow-hidden ck-csl-pos-' . str_replace( '_', '-', $content_pos );
        if ( $equal_h ) $item_cls .= ' ck-eq-height h-full';
        if ( in_array( $content_pos, [ 'left', 'right' ], true ) ) $item_cls .= ' items-stretch';

        $thumb_wrap_cls = 'ck-csl-thumb-wrap overflow-hidden leading-[0] relative';
        if ( in_array( $content_pos, [ 'left', 'right' ], true ) ) {
            $thumb_wrap_cls .= ' basis-[45%] max-w-[45%] shrink-0';
        } elseif ( 'above' === $content_pos ) {
            $thumb_wrap_cls .= ' flex-none w-full'; // height comes from the flex-grow rule in StylesTrait
        } else {
            // Below (default) and overlay positions have no flex-based height
            // source, so pin every thumbnail to the same square box — otherwise
            // a tall product photo and a small square logo render at different
            // heights and the row of cards no longer lines up.
            $thumb_wrap_cls .= ' flex-none w-full aspect-square';
        }

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

        $pad = esc_attr( intval( $a['contentPadTop']    ?? 15 ) . 'px '
                       . intval( $a['contentPadRight']  ?? 10 ) . 'px '
                       . intval( $a['contentPadBottom'] ?? 15 ) . 'px '
                       . intval( $a['contentPadLeft']   ?? 10 ) . 'px' );

        return compact( 'content_pos', 'is_overlay', 'equal_h', 'item_cls', 'thumb_wrap_cls', 'details_cls', 'pad' );
    }

    private function render_item( WP_Term $term, array $ctx ): void {
        $a           = $this->a;
        $link        = get_term_link( $term );
        $thumb_size  = $a['thumbnailImgSize'] ?? 'medium';
        $show_thumb         = isset( $a['showThumbnail'] ) ? (bool) $a['showThumbnail'] : true;
        $thumb_id           = get_term_meta( $term->term_id, 'thumbnail_id', true );
        $thumb_url          = $thumb_id ? wp_get_attachment_image_url( $thumb_id, $thumb_size ) : '';
        $use_placeholder    = ! empty( $a['useCustomPlaceholder'] );
        $placeholder_url    = isset( $a['customPlaceholderUrl'] ) ? esc_url_raw( $a['customPlaceholderUrl'] ) : '';
        if ( ! $thumb_url && $use_placeholder && $placeholder_url ) {
            $thumb_url = $placeholder_url;
        }

        $image_mode   = $a['imageMode'] ?? 'normal';
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
        $show_shop    = ! empty( $a['showShopNow'] );
        $shop_label   = sanitize_text_field( $a['shopNowLabel'] ?? 'Shop Now' );
        $shop_align   = $a['shopNowAlignment'] ?? 'center';
        $shop_target  = $a['shopNowTarget']    ?? '_self';
        $shop_mt      = intval( $a['shopNowMarginTop'] ?? 10 );
        ?>
        <div class="<?php echo esc_attr( $ctx['item_cls'] ); ?>">

            <?php if ( $show_thumb ) : ?>
            <div class="<?php echo esc_attr( $ctx['thumb_wrap_cls'] ); ?>">
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
                <?php if ( 'custom_color' === $image_mode ) : ?>
                <div class="ck-csl-thumb-color-overlay" aria-hidden="true"></div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php if ( $ctx['is_overlay'] ) : ?>
            <div class="ck-csl-overlay absolute inset-0 pointer-events-none z-[1] transition-[background] duration-300"></div>
            <?php endif; ?>

            <div class="<?php echo esc_attr( $ctx['details_cls'] ); ?>" style="padding:<?php echo $ctx['pad']; ?>">

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
        <?php
    }

    private function render_cup_group( array $group ): void {
        $a        = $this->a;
        $parent   = $group['parent'];   // WP_Term|null
        $children = $group['children']; // WP_Term[]

        $show_thumb  = isset( $a['showThumbnail'] ) ? (bool) $a['showThumbnail'] : true;
        $thumb_size  = $a['thumbnailImgSize'] ?? 'medium';
        $image_mode  = $a['imageMode'] ?? 'normal';
        $show_count  = ! empty( $a['showProductCount'] );
        $count_b     = $a['productCountBefore'] ?? '(';
        $count_a     = $a['productCountAfter']  ?? ')';
        $name_mt     = intval( $a['catNameMarginTop'] ?? 10 );

        $pad = esc_attr( intval( $a['contentPadTop']    ?? 15 ) . 'px '
                       . intval( $a['contentPadRight']  ?? 10 ) . 'px '
                       . intval( $a['contentPadBottom'] ?? 15 ) . 'px '
                       . intval( $a['contentPadLeft']   ?? 10 ) . 'px' );

        $p_link  = '';
        $p_thumb = '';
        $p_name  = '';
        $p_count = 0;
        if ( $parent instanceof WP_Term ) {
            $raw_link = get_term_link( $parent );
            $p_link   = is_wp_error( $raw_link ) ? '#' : $raw_link;
            $p_name   = $parent->name;
            $p_count  = (int) $parent->count;
            $thumb_id = get_term_meta( $parent->term_id, 'thumbnail_id', true );
            $p_thumb  = $thumb_id ? wp_get_attachment_image_url( $thumb_id, $thumb_size ) : '';
        }
        ?>
        <div class="ck-csl-item ck-csl-cup-card relative flex flex-col bg-white rounded overflow-hidden">

            <?php if ( $show_thumb && $parent ) : ?>
            <div class="ck-csl-thumb-wrap overflow-hidden leading-[0] relative">
                <?php if ( $p_thumb ) : ?>
                    <a href="<?php echo esc_url( $p_link ); ?>" tabindex="-1">
                        <img src="<?php echo esc_url( $p_thumb ); ?>"
                             alt="<?php echo esc_attr( $p_name ); ?>"
                             class="ck-csl-thumb w-full h-auto block [transition:transform_0.4s_ease,filter_0.3s_ease]"
                             loading="lazy" />
                    </a>
                <?php else : ?>
                    <div class="ck-csl-thumb-placeholder w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>
                <?php endif; ?>
                <?php if ( 'custom_color' === $image_mode ) : ?>
                <div class="ck-csl-thumb-color-overlay" aria-hidden="true"></div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <div class="ck-csl-cup-details flex-1" style="padding:<?php echo $pad; ?>">

                <?php if ( $parent ) : ?>
                <div class="ck-csl-cat-name" style="margin-top:<?php echo esc_attr( $name_mt ); ?>px">
                    <a href="<?php echo esc_url( $p_link ); ?>" class="ck-csl-cup-parent-link no-underline leading-[1.3]">
                        <?php echo esc_html( $p_name ); ?>
                        <?php if ( $show_count ) : ?>
                            <span class="ck-csl-count"><?php echo esc_html( $count_b . $p_count . $count_a ); ?></span>
                        <?php endif; ?>
                    </a>
                </div>
                <?php endif; ?>

                <?php if ( $children ) : ?>
                <div class="ck-csl-cup-pills">
                    <?php foreach ( $children as $child ) :
                        if ( ! ( $child instanceof WP_Term ) ) continue;
                        $c_link = get_term_link( $child );
                        if ( is_wp_error( $c_link ) ) continue;
                        ?>
                        <a href="<?php echo esc_url( $c_link ); ?>" class="ck-csl-cup-pill">
                            <?php echo esc_html( $child->name ); ?>
                            <?php if ( $show_count ) : ?>
                                <span class="ck-csl-cup-pill-count"><?php echo intval( $child->count ); ?></span>
                            <?php endif; ?>
                        </a>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
}
