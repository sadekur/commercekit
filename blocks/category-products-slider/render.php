<?php
/**
 * Render template for the Category Products Slider block.
 *
 * Available in scope: $attributes (array), $content (string), $block (WP_Block)
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	echo '<p class="p-4 bg-amber-50 border border-amber-300 rounded text-amber-800 text-sm">'
		. esc_html__( 'WooCommerce is required for the Category Products Slider block.', 'commerce-kit' )
		. '</p>';
	return;
}

// ── General ───────────────────────────────────────────────────────────────────
$layout            = $attributes['layout']            ?? 'carousel';
$col_large         = max( 1, intval( $attributes['colLarge']    ?? 4 ) );
$col_desktop       = max( 1, intval( $attributes['colDesktop']  ?? 3 ) );
$col_laptop        = max( 1, intval( $attributes['colLaptop']   ?? 2 ) );
$col_tablet        = max( 1, intval( $attributes['colTablet']   ?? 2 ) );
$col_mobile        = max( 1, intval( $attributes['colMobile']   ?? 1 ) );

// Slider (1-col) layout forces a single slide visible at all breakpoints.
if ( 'slider' === $layout ) {
	$col_large = $col_desktop = $col_laptop = $col_tablet = $col_mobile = 1;
}
$space_between     = intval( $attributes['spaceBetween']        ?? 20 );
$filter_type       = $attributes['filterType']        ?? 'all';
$specific_cats     = $attributes['specificCategories'] ?? '';
$hide_empty        = ! empty( $attributes['hideEmpty'] );
$hide_no_thumb     = ! empty( $attributes['hideCatWithoutThumb'] );
$total_cats        = max( 1, intval( $attributes['totalCategories'] ?? 12 ) );
$order_by          = $attributes['orderBy']           ?? 'name';
$order             = $attributes['order']             ?? 'ASC';
$randomize         = ! empty( $attributes['randomize'] );

// ── Display – Basic Styles ────────────────────────────────────────────────────
$show_section_title  = isset( $attributes['showSectionTitle'] ) ? (bool) $attributes['showSectionTitle'] : true;
$section_title_text  = sanitize_text_field( $attributes['sectionTitleText'] ?? 'Category Showcase' );
$content_position    = $attributes['contentPosition']    ?? 'below';
$overlay_bg          = $attributes['overlayBgColor']     ?? 'rgba(0,0,0,0.5)';
$overlay_hover_bg    = $attributes['overlayHoverBgColor'] ?? 'rgba(0,0,0,0.75)';
$overlay_visibility  = $attributes['overlayContentVisibility'] ?? 'always';
$equal_height        = isset( $attributes['equalHeight'] ) ? (bool) $attributes['equalHeight'] : true;
$pad_top             = intval( $attributes['contentPadTop']    ?? 15 );
$pad_right           = intval( $attributes['contentPadRight']  ?? 10 );
$pad_bottom          = intval( $attributes['contentPadBottom'] ?? 15 );
$pad_left            = intval( $attributes['contentPadLeft']   ?? 10 );

// ── Display – Category Content ────────────────────────────────────────────────
$show_cat_name      = isset( $attributes['showCatName'] ) ? (bool) $attributes['showCatName'] : true;
$show_count         = ! empty( $attributes['showProductCount'] );
$count_pos          = $attributes['productCountPos']    ?? 'beside';
$count_before       = $attributes['productCountBefore'] ?? '(';
$count_after        = $attributes['productCountAfter']  ?? ')';
$show_description   = ! empty( $attributes['showDescription'] );
$show_custom_text   = ! empty( $attributes['showCustomText'] );
$custom_text        = sanitize_text_field( $attributes['customText'] ?? '' );

// ── Display – Shop Now ────────────────────────────────────────────────────────
$show_shop_now      = ! empty( $attributes['showShopNow'] );
$shop_now_label     = sanitize_text_field( $attributes['shopNowLabel'] ?? 'Shop Now' );
$shop_now_bg        = $attributes['shopNowBgColor']      ?? '#cc2b5e';
$shop_now_hover_bg  = $attributes['shopNowHoverBg']      ?? '#a02049';
$shop_now_text_c    = $attributes['shopNowTextColor']    ?? '#ffffff';
$shop_now_radius    = intval( $attributes['shopNowBorderRadius'] ?? 3 );
$shop_now_align     = $attributes['shopNowAlignment']    ?? 'center';
$shop_now_target    = $attributes['shopNowTarget']       ?? '_self';
$shop_now_margin_t  = intval( $attributes['shopNowMarginTop'] ?? 10 );

// ── Display – Typography ──────────────────────────────────────────────────────
$cat_name_color     = $attributes['catNameColor']      ?? '#333333';
$cat_name_size      = intval( $attributes['catNameFontSize']   ?? 16 );
$cat_name_weight    = $attributes['catNameFontWeight'] ?? '700';
$cat_name_mt        = intval( $attributes['catNameMarginTop']  ?? 10 );
$desc_color         = $attributes['descColor']         ?? '#666666';
$desc_size          = intval( $attributes['descFontSize']      ?? 14 );
$desc_mt            = intval( $attributes['descMarginTop']     ?? 6 );
$count_color        = $attributes['countColor']        ?? '#888888';
$count_size         = intval( $attributes['countFontSize']     ?? 13 );

// ── Thumbnail ─────────────────────────────────────────────────────────────────
$show_thumb         = isset( $attributes['showThumbnail'] ) ? (bool) $attributes['showThumbnail'] : true;
$thumb_img_size     = $attributes['thumbnailImgSize']  ?? 'medium';
$thumb_shape        = $attributes['thumbnailShape']    ?? 'square';
$thumb_radius       = intval( $attributes['thumbnailRadius']   ?? 0 );
$show_border        = ! empty( $attributes['showThumbBorder'] );
$border_width       = intval( $attributes['thumbBorderWidth']  ?? 1 );
$border_style       = $attributes['thumbBorderStyle']  ?? 'solid';
$border_color       = $attributes['thumbBorderColor']  ?? '#dddddd';
$show_shadow        = ! empty( $attributes['showBoxShadow'] );
$shadow_h           = intval( $attributes['boxShadowH']     ?? 0 );
$shadow_v           = intval( $attributes['boxShadowV']     ?? 4 );
$shadow_blur        = intval( $attributes['boxShadowBlur']  ?? 15 );
$shadow_spread      = intval( $attributes['boxShadowSpread'] ?? 0 );
$shadow_color       = $attributes['boxShadowColor']    ?? 'rgba(0,0,0,0.15)';
$thumb_inner_pad    = intval( $attributes['thumbInnerPad']     ?? 0 );
$thumb_margin_b     = intval( $attributes['thumbMarginBottom'] ?? 0 );
$thumb_zoom         = $attributes['thumbnailZoom']     ?? 'none';
$image_mode         = $attributes['imageMode']         ?? 'normal';

// ── Slider Controls ───────────────────────────────────────────────────────────
$autoplay           = isset( $attributes['autoplay'] ) ? (bool) $attributes['autoplay'] : true;
$autoplay_speed     = intval( $attributes['autoplaySpeed']   ?? 3000 );
$scroll_speed       = intval( $attributes['scrollSpeed']     ?? 600 );
$slides_to_scroll   = max( 1, intval( $attributes['slidesToScroll'] ?? 1 ) );
$pause_on_hover     = isset( $attributes['pauseOnHover'] ) ? (bool) $attributes['pauseOnHover'] : true;
$infinite_loop      = isset( $attributes['infiniteLoop'] ) ? (bool) $attributes['infiniteLoop'] : true;
$adaptive_height    = ! empty( $attributes['adaptiveHeight'] );
$slide_effect       = $attributes['slideEffect']       ?? 'slide';
$rtl                = ! empty( $attributes['rtlDirection'] );

// ── Navigation ────────────────────────────────────────────────────────────────
$show_nav           = isset( $attributes['showNavigation'] ) ? (bool) $attributes['showNavigation'] : true;
$nav_icon_style     = intval( $attributes['navIconStyle']  ?? 1 );
$nav_icon_size      = intval( $attributes['navIconSize']   ?? 22 );
$nav_color          = $attributes['navColor']          ?? '#333333';
$nav_hover_color    = $attributes['navHoverColor']     ?? '#ffffff';
$nav_bg             = $attributes['navBgColor']        ?? '#ffffff';
$nav_hover_bg       = $attributes['navHoverBgColor']   ?? '#cc2b5e';
$nav_border_color   = $attributes['navBorderColor']    ?? '#dddddd';
$nav_hover_border   = $attributes['navHoverBorderColor'] ?? '#cc2b5e';
$nav_radius         = intval( $attributes['navBorderRadius'] ?? 50 );

// ── Pagination ────────────────────────────────────────────────────────────────
$show_pager         = ! empty( $attributes['showSliderPagination'] );
$pager_type         = $attributes['sliderPaginationType']    ?? 'bullets';
$pager_color        = $attributes['paginationColor']         ?? '#cc2b5e';
$pager_active_color = $attributes['paginationActiveColor']   ?? '#333333';

// ── Miscellaneous ─────────────────────────────────────────────────────────────
$touch_swipe        = isset( $attributes['touchSwipe'] ) ? (bool) $attributes['touchSwipe'] : true;
$mousewheel         = ! empty( $attributes['mousewheelControl'] );
$mouse_drag         = isset( $attributes['mouseDraggable'] ) ? (bool) $attributes['mouseDraggable'] : true;
$free_mode          = ! empty( $attributes['freeMode'] );

// ── Fetch categories ──────────────────────────────────────────────────────────
$term_args = [
	'taxonomy'   => 'product_cat',
	'hide_empty' => $hide_empty,
	'number'     => $total_cats,
];

if ( ! $randomize ) {
	$term_args['orderby'] = $order_by;
	$term_args['order']   = $order;
}

if ( 'specific' === $filter_type && ! empty( $specific_cats ) ) {
	$ids = array_map( 'intval', array_filter( array_map( 'trim', explode( ',', $specific_cats ) ) ) );
	if ( ! empty( $ids ) ) {
		$term_args['include'] = $ids;
		unset( $term_args['number'] );
	}
}

// Exclude the WooCommerce default "Uncategorized" category.
$default_cat_id = (int) get_option( 'default_product_cat', 0 );
if ( $default_cat_id > 0 ) {
	$term_args['exclude'] = [ $default_cat_id ];
}

$terms = get_terms( $term_args );

if ( is_wp_error( $terms ) || empty( $terms ) ) {
	echo '<p class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">' . esc_html__( 'No product categories found.', 'commerce-kit' ) . '</p>';
	return;
}

if ( $randomize ) {
	shuffle( $terms );
}

if ( $hide_no_thumb ) {
	$terms = array_filter( $terms, function ( $t ) {
		return (bool) get_term_meta( $t->term_id, 'thumbnail_id', true );
	} );
	if ( empty( $terms ) ) {
		echo '<p class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">' . esc_html__( 'No categories with thumbnails found.', 'commerce-kit' ) . '</p>';
		return;
	}
}

// ── Enqueue Swiper ────────────────────────────────────────────────────────────
wp_enqueue_style(
	'ck-swiper',
	'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
	[],
	'11'
);
wp_enqueue_script(
	'ck-swiper',
	'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
	[],
	'11',
	true
);

// ── Helpers ───────────────────────────────────────────────────────────────────
$uid         = 'ck-csl-' . wp_unique_id();
$is_overlay  = in_array( $content_position, [ 'overlay', 'overlay_top', 'overlay_middle', 'overlay_bottom', 'overlay_box' ], true );

// Thumbnail border-radius
$thumb_br = '0px';
if ( 'rounded' === $thumb_shape ) {
	$thumb_br = '8px';
} elseif ( 'circle' === $thumb_shape ) {
	$thumb_br = '50%';
} elseif ( $thumb_radius > 0 ) {
	$thumb_br = $thumb_radius . 'px';
}

// Box-shadow string
$shadow_css = $show_shadow
	? "{$shadow_h}px {$shadow_v}px {$shadow_blur}px {$shadow_spread}px {$shadow_color}"
	: 'none';

// Thumbnail border
$thumb_border_css = $show_border
	? "{$border_width}px {$border_style} {$border_color}"
	: 'none';

// Navigation icons
$nav_icons = [
	1 => [ 'prev' => '<polyline points="15 18 9 12 15 6"/>',                   'next' => '<polyline points="9 18 15 12 9 6"/>' ],
	2 => [ 'prev' => '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',  'next' => '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>' ],
	3 => [ 'prev' => '<circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/>',
	        'next' => '<circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/>' ],
];
$icon_idx      = min( 3, max( 1, $nav_icon_style ) );
$icon_prev_svg = $nav_icons[ $icon_idx ]['prev'];
$icon_next_svg = $nav_icons[ $icon_idx ]['next'];

// Swiper config array
$swiper_cfg = [
	'slidesPerView'  => $col_mobile,
	'spaceBetween'   => $space_between,
	'speed'          => $scroll_speed,
	'loop'           => $infinite_loop,
	'effect'         => $slide_effect,
	'dir'            => $rtl ? 'rtl' : 'ltr',
	'grabCursor'     => $mouse_drag,
	'allowTouchMove' => $touch_swipe,
	'freeMode'       => $free_mode,
	'mousewheel'     => $mousewheel ? [ 'forceToAxis' => true ] : false,
	'autoHeight'     => $adaptive_height,
	'autoplay'       => $autoplay
		? [ 'delay' => $autoplay_speed, 'disableOnInteraction' => false, 'pauseOnMouseEnter' => $pause_on_hover ]
		: false,
	'navigation'     => $show_nav
		? [ 'nextEl' => '#' . $uid . ' .ck-csl-next', 'prevEl' => '#' . $uid . ' .ck-csl-prev' ]
		: false,
	'pagination'     => $show_pager
		? [
			'el'             => '#' . $uid . ' .ck-csl-pager',
			'type'           => 'fraction' === $pager_type ? 'fraction' : ( 'progressbar' === $pager_type ? 'progressbar' : 'bullets' ),
			'clickable'      => true,
			'dynamicBullets' => 'dynamic' === $pager_type,
		]
		: false,
	'breakpoints'    => [
		'480'  => [ 'slidesPerView' => $col_tablet,  'slidesPerGroup' => $slides_to_scroll ],
		'768'  => [ 'slidesPerView' => $col_laptop,  'slidesPerGroup' => $slides_to_scroll ],
		'1024' => [ 'slidesPerView' => $col_desktop, 'slidesPerGroup' => $slides_to_scroll ],
		'1280' => [ 'slidesPerView' => $col_large,   'slidesPerGroup' => $slides_to_scroll ],
	],
];

// ── Render ────────────────────────────────────────────────────────────────────
ob_start();
?>
<div id="<?php echo esc_attr( $uid ); ?>"
	 class="ck-csl-wrap<?php echo $rtl ? ' ck-csl-rtl' : ''; ?><?php echo $show_pager ? ' ck-csl-has-pager' : ''; ?>"
	 dir="<?php echo $rtl ? 'rtl' : 'ltr'; ?>">

	<?php if ( $show_section_title && $section_title_text ) : ?>
		<h3 class="ck-csl-section-title"><?php echo esc_html( $section_title_text ); ?></h3>
	<?php endif; ?>

	<div class="ck-csl-outer<?php echo $show_nav ? ' ck-has-nav' : ''; ?>">

		<?php if ( $show_nav ) : ?>
		<div class="ck-csl-nav-wrap">
			<div class="ck-csl-prev ck-csl-nav-btn" role="button" aria-label="<?php esc_attr_e( 'Previous', 'commerce-kit' ); ?>">
				<svg xmlns="http://www.w3.org/2000/svg"
					 width="<?php echo esc_attr( $nav_icon_size ); ?>"
					 height="<?php echo esc_attr( $nav_icon_size ); ?>"
					 viewBox="0 0 24 24" fill="none" stroke="currentColor"
					 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<?php echo $icon_prev_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</svg>
			</div>
			<div class="ck-csl-next ck-csl-nav-btn" role="button" aria-label="<?php esc_attr_e( 'Next', 'commerce-kit' ); ?>">
				<svg xmlns="http://www.w3.org/2000/svg"
					 width="<?php echo esc_attr( $nav_icon_size ); ?>"
					 height="<?php echo esc_attr( $nav_icon_size ); ?>"
					 viewBox="0 0 24 24" fill="none" stroke="currentColor"
					 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<?php echo $icon_next_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</svg>
			</div>
		</div>
		<?php endif; ?>

		<div class="swiper ck-csl-swiper">
			<div class="swiper-wrapper">
				<?php foreach ( $terms as $term ) :
					if ( ! ( $term instanceof WP_Term ) ) continue;

					$term_link  = get_term_link( $term );
					$thumb_id   = get_term_meta( $term->term_id, 'thumbnail_id', true );
					$thumb_url  = $thumb_id ? wp_get_attachment_image_url( $thumb_id, $thumb_img_size ) : '';
					$item_class = 'ck-csl-item ck-csl-pos-' . esc_attr( str_replace( '_', '-', $content_position ) );
					if ( $equal_height ) $item_class .= ' ck-eq-height';
					?>
					<div class="swiper-slide ck-csl-slide">
						<div class="<?php echo esc_attr( $item_class ); ?>">

							<?php if ( $show_thumb ) : ?>
							<div class="ck-csl-thumb-wrap">
								<?php if ( $thumb_url ) : ?>
									<a href="<?php echo esc_url( $term_link ); ?>" tabindex="-1">
										<img src="<?php echo esc_url( $thumb_url ); ?>"
											 alt="<?php echo esc_attr( $term->name ); ?>"
											 class="ck-csl-thumb"
											 loading="lazy" />
									</a>
								<?php else : ?>
									<div class="ck-csl-thumb-placeholder">
										<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
									</div>
								<?php endif; ?>
							</div>
							<?php endif; ?>

							<?php if ( $is_overlay ) : ?>
							<div class="ck-csl-overlay"></div>
							<?php endif; ?>

							<div class="ck-csl-details"
								 style="padding:<?php echo esc_attr( "{$pad_top}px {$pad_right}px {$pad_bottom}px {$pad_left}px" ); ?>">

								<?php if ( $show_cat_name ) : ?>
								<div class="ck-csl-cat-name" style="margin-top:<?php echo esc_attr( $cat_name_mt ); ?>px">
									<a href="<?php echo esc_url( $term_link ); ?>">
										<?php echo esc_html( $term->name ); ?>
										<?php if ( $show_count && 'beside' === $count_pos ) : ?>
											<span class="ck-csl-count"><?php echo esc_html( $count_before . $term->count . $count_after ); ?></span>
										<?php endif; ?>
									</a>
								</div>
								<?php endif; ?>

								<?php if ( $show_count && 'under' === $count_pos ) : ?>
								<div class="ck-csl-product-count" style="margin-top:4px">
									<?php echo esc_html( $count_before . $term->count . $count_after ); ?>
								</div>
								<?php endif; ?>

								<?php if ( $show_custom_text && $custom_text ) : ?>
								<div class="ck-csl-custom-text"><?php echo esc_html( $custom_text ); ?></div>
								<?php endif; ?>

								<?php if ( $show_description && $term->description ) : ?>
								<div class="ck-csl-cat-desc" style="margin-top:<?php echo esc_attr( $desc_mt ); ?>px">
									<?php echo wp_kses_post( $term->description ); ?>
								</div>
								<?php endif; ?>

								<?php if ( $show_shop_now ) : ?>
								<div class="ck-csl-shop-now-wrap" style="margin-top:<?php echo esc_attr( $shop_now_margin_t ); ?>px;text-align:<?php echo esc_attr( $shop_now_align ); ?>">
									<a href="<?php echo esc_url( $term_link ); ?>"
									   class="ck-csl-shop-now"
									   target="<?php echo esc_attr( $shop_now_target ); ?>"
									   <?php echo $shop_now_target === '_blank' ? 'rel="noopener noreferrer"' : ''; ?>>
										<?php echo esc_html( $shop_now_label ); ?>
									</a>
								</div>
								<?php endif; ?>

							</div><!-- .ck-csl-details -->

						</div><!-- .ck-csl-item -->
					</div><!-- .swiper-slide -->
				<?php endforeach; ?>
			</div><!-- .swiper-wrapper -->

			<?php if ( $show_pager ) : ?>
			<div class="ck-csl-pager swiper-pagination"></div>
			<?php endif; ?>
		</div><!-- .swiper -->

	</div><!-- .ck-csl-outer -->

</div><!-- .ck-csl-wrap -->

<style id="<?php echo esc_attr( $uid ); ?>-css">
#<?php echo esc_attr( $uid ); ?> .ck-csl-section-title {
	margin-bottom: 20px;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-thumb {
	border-radius: <?php echo esc_attr( $thumb_br ); ?>;
	border: <?php echo esc_attr( $thumb_border_css ); ?>;
	box-shadow: <?php echo esc_attr( $shadow_css ); ?>;
	padding: <?php echo esc_attr( $thumb_inner_pad ); ?>px;
	margin-bottom: <?php echo esc_attr( $thumb_margin_b ); ?>px;
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
	transition: background 0.3s ease<?php echo 'on_hover' === $overlay_visibility ? ', opacity 0.3s ease' : ''; ?>;
	<?php echo 'on_hover' === $overlay_visibility ? 'opacity:0;' : ''; ?>
}
<?php if ( 'on_hover' === $overlay_visibility ) : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-item:hover .ck-csl-overlay { opacity: 1; background: <?php echo esc_attr( $overlay_hover_bg ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-details { opacity: 0; transition: opacity 0.3s ease; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-item:hover .ck-csl-details { opacity: 1; }
<?php else : ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-item:hover .ck-csl-overlay { background: <?php echo esc_attr( $overlay_hover_bg ); ?>; }
<?php endif; ?>
#<?php echo esc_attr( $uid ); ?> .ck-csl-cat-name a {
	font-size: <?php echo esc_attr( $cat_name_size ); ?>px;
	font-weight: <?php echo esc_attr( $cat_name_weight ); ?>;
	color: <?php echo esc_attr( $cat_name_color ); ?>;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-count {
	font-size: <?php echo esc_attr( $count_size ); ?>px;
	color: <?php echo esc_attr( $count_color ); ?>;
	margin-left: 4px;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-product-count {
	font-size: <?php echo esc_attr( $count_size ); ?>px;
	color: <?php echo esc_attr( $count_color ); ?>;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-cat-desc {
	font-size: <?php echo esc_attr( $desc_size ); ?>px;
	color: <?php echo esc_attr( $desc_color ); ?>;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-shop-now {
	display: inline-block;
	padding: 8px 18px;
	background: <?php echo esc_attr( $shop_now_bg ); ?>;
	color: <?php echo esc_attr( $shop_now_text_c ); ?>;
	border-radius: <?php echo esc_attr( $shop_now_radius ); ?>px;
	text-decoration: none;
	font-weight: 600;
	transition: background 0.2s ease;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-shop-now:hover { background: <?php echo esc_attr( $shop_now_hover_bg ); ?>; }
#<?php echo esc_attr( $uid ); ?> .ck-csl-nav-btn {
	width: <?php echo esc_attr( $nav_icon_size + 18 ); ?>px;
	height: <?php echo esc_attr( $nav_icon_size + 18 ); ?>px;
	color: <?php echo esc_attr( $nav_color ); ?>;
	background: <?php echo esc_attr( $nav_bg ); ?>;
	border: 1px solid <?php echo esc_attr( $nav_border_color ); ?>;
	border-radius: <?php echo esc_attr( $nav_radius ); ?>px;
}
#<?php echo esc_attr( $uid ); ?> .ck-csl-nav-btn:hover {
	color: <?php echo esc_attr( $nav_hover_color ); ?>;
	background: <?php echo esc_attr( $nav_hover_bg ); ?>;
	border-color: <?php echo esc_attr( $nav_hover_border ); ?>;
}
<?php if ( $show_pager ) : ?>
#<?php echo esc_attr( $uid ); ?> .swiper-pagination-bullet { background: <?php echo esc_attr( $pager_color ); ?>; opacity: 0.5; }
#<?php echo esc_attr( $uid ); ?> .swiper-pagination-bullet-active { background: <?php echo esc_attr( $pager_active_color ); ?>; opacity: 1; }
#<?php echo esc_attr( $uid ); ?> .swiper-pagination-progressbar .swiper-pagination-progressbar-fill { background: <?php echo esc_attr( $pager_active_color ); ?>; }
<?php endif; ?>
</style>

<script>
(function () {
	'use strict';
	function ckCslInit() {
		var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
		if (!wrap || typeof Swiper === 'undefined') return;
		var el = wrap.querySelector('.ck-csl-swiper');
		if (!el) return;
		var cfg = <?php echo wp_json_encode( $swiper_cfg ); ?>;
		new Swiper(el, cfg);
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', ckCslInit);
	} else {
		ckCslInit();
	}
	// Also fire on window load in case Swiper CDN loads late (footer script).
	window.addEventListener('load', function () {
		var wrap = document.getElementById('<?php echo esc_js( $uid ); ?>');
		if (!wrap) return;
		var el = wrap.querySelector('.ck-csl-swiper');
		if (el && !el.classList.contains('swiper-initialized')) {
			ckCslInit();
		}
	});
})();
</script>
<?php
echo ob_get_clean();
