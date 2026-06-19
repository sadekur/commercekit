import { Spinner } from '@wordpress/components';
import { __ }     from '@wordpress/i18n';

const Preview = ({ attributes, categories, isLoading, fetchError }) => {
	const {
		layout, colDesktop, spaceBetween,
		contentPosition,
		showSectionTitle, sectionTitleText,
		showThumbnail, thumbnailShape, thumbnailRadius,
		showThumbBorder, thumbBorderWidth, thumbBorderStyle, thumbBorderColor,
		showBoxShadow, boxShadowH, boxShadowV, boxShadowBlur, boxShadowSpread, boxShadowColor,
		thumbInnerPad, thumbMarginBottom, thumbnailZoom, imageMode, imageCustomColor,
		contentPadTop, contentPadRight, contentPadBottom, contentPadLeft,
		overlayBgColor,
		useCustomPlaceholder, customPlaceholderUrl,
		showCatName, catNameFontSize, catNameFontWeight, catNameColor, catNameMarginTop,
		showProductCount, productCountPos, productCountBefore, productCountAfter,
		countFontSize, countColor,
		showCustomText, customText, customTextColor,
		showDescription, descFontSize, descColor, descMarginTop,
		showShopNow, shopNowLabel, shopNowBgColor, shopNowTextColor,
		shopNowBorderRadius, shopNowAlignment, shopNowMarginTop,
	} = attributes;

	const isAbove   = contentPosition === 'above';
	const isLeft    = contentPosition === 'left';
	const isRight   = contentPosition === 'right';
	const isSide    = isLeft || isRight;
	const isOverlay = [ 'overlay', 'overlay_top', 'overlay_middle', 'overlay_box' ].includes( contentPosition );

	const previewCount = layout === 'slider' ? 1 : Math.min( colDesktop || 3, 4 );
	const previewCats  = categories.slice( 0, previewCount );

	const thumbBr = thumbnailShape === 'circle'  ? '50%'
	              : thumbnailShape === 'rounded' ? '8px'
	              : thumbnailRadius > 0           ? thumbnailRadius + 'px'
	              : '0';

	const thumbWrapBase = {
		overflow:   'hidden',
		borderRadius: thumbBr,
		border:     showThumbBorder ? `${thumbBorderWidth}px ${thumbBorderStyle} ${thumbBorderColor}` : 'none',
		boxShadow:  showBoxShadow   ? `${boxShadowH}px ${boxShadowV}px ${boxShadowBlur}px ${boxShadowSpread}px ${boxShadowColor}` : 'none',
		padding:    thumbInnerPad   ? thumbInnerPad + 'px' : 0,
		background: '#f0f0f0',
		lineHeight: 0,
		filter:     imageMode === 'grayscale' ? 'grayscale(100%)' : 'none',
	};

	const PlaceholderImg = () => (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', aspectRatio: '1' }}>
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
				<rect x="3" y="3" width="18" height="18" rx="2"/>
				<circle cx="8.5" cy="8.5" r="1.5"/>
				<polyline points="21 15 16 10 5 21"/>
			</svg>
		</div>
	);

	// zoom_out starts at scale(1.1) and zooms back to 1 on hover (visible in static preview).
	// zoom_in starts at scale(1) and zooms to 1.1 on hover only (no static transform needed).
	const zoomStyle = thumbnailZoom === 'zoom_out'
		? { transform: 'scale(1.1)', transition: 'transform 0.4s ease' }
		: thumbnailZoom === 'zoom_in'
		? { transition: 'transform 0.4s ease' }
		: {};

	const renderThumb = ( cat, extraWrapStyle = {}, imgStyle = { width: '100%', display: 'block' } ) => {
		const src = cat.image && cat.image.src
			? cat.image.src
			: ( useCustomPlaceholder && customPlaceholderUrl ? customPlaceholderUrl : null );
		const alt = cat.image && cat.image.alt ? cat.image.alt : cat.name;
		return (
			<div style={{ ...thumbWrapBase, ...extraWrapStyle }}>
				{ src
					? <img src={src} alt={alt} style={{ ...imgStyle, borderRadius: thumbBr, ...zoomStyle }} />
					: <PlaceholderImg />
				}
			</div>
		);
	};

	const renderContent = ( cat, overrideColor = null ) => {
		const desc       = ( cat.description || '' ).replace( /<[^>]+>/g, '' );
		const nameColor  = overrideColor || catNameColor;
		const cntColor   = overrideColor || countColor;
		const custColor  = overrideColor || customTextColor;
		const dscColor   = overrideColor || descColor;
		const noDescColor = overrideColor ? 'rgba(255,255,255,0.45)' : '#bbb';

		return (
			<>
				{ showCatName && (
					<div style={{ fontWeight: catNameFontWeight, fontSize: catNameFontSize, color: nameColor, marginTop: catNameMarginTop, lineHeight: 1.3 }}>
						{ cat.name }
						{ showProductCount && productCountPos === 'beside' && (
							<span style={{ fontSize: countFontSize, color: cntColor, marginLeft: 4 }}>
								{ productCountBefore }{ cat.count }{ productCountAfter }
							</span>
						) }
					</div>
				) }
				{ showProductCount && productCountPos === 'under' && (
					<div style={{ fontSize: countFontSize, color: cntColor, marginTop: 4 }}>
						{ productCountBefore }{ cat.count }{ productCountAfter }
					</div>
				) }
				{ showCustomText && customText && (
					<div style={{ fontSize: 13, color: custColor, marginTop: 6 }}>{ customText }</div>
				) }
				{ showDescription && (
					<div style={{ fontSize: descFontSize, color: dscColor, marginTop: descMarginTop, lineHeight: 1.5 }}>
						{ desc || <em style={{ color: noDescColor }}>{ __( '(no description)', 'commerce-kit' ) }</em> }
					</div>
				) }
				{ showShopNow && (
					<div style={{ textAlign: shopNowAlignment, marginTop: shopNowMarginTop }}>
						<span style={{ display: 'inline-block', padding: '8px 18px', background: shopNowBgColor, color: shopNowTextColor, borderRadius: shopNowBorderRadius, fontSize: 13, fontWeight: 600, cursor: 'default' }}>
							{ shopNowLabel }
						</span>
					</div>
				) }
			</>
		);
	};

	const cardBaseStyle = ( cardWidth ) =>
		layout === 'grid'
			? { minWidth: 0 }
			: { flex: `0 0 ${cardWidth}`, minWidth: 0 };

	return (
		<div className="ck-csl-editor-preview">

			{ showSectionTitle && sectionTitleText && (
				<h3 className="ck-csl-editor-title">{ sectionTitleText }</h3>
			) }

			{ isLoading && (
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#888' }}>
					<Spinner />
					<span style={{ fontSize: 13 }}>{ __( 'Loading categories…', 'commerce-kit' ) }</span>
				</div>
			) }

			{ !isLoading && fetchError && (
				<div style={{ padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, fontSize: 13, color: '#856404' }}>
					{ __( 'Could not load categories. Make sure WooCommerce is active and you are logged in as an administrator.', 'commerce-kit' ) }
				</div>
			) }

			{ !isLoading && !fetchError && categories.length === 0 && (
				<div style={{ padding: '12px 16px', background: '#f0f0f0', borderRadius: 4, fontSize: 13, color: '#555' }}>
					{ __( 'No categories found with the current settings.', 'commerce-kit' ) }
				</div>
			) }

			{ !isLoading && !fetchError && previewCats.length > 0 && (
				<div
					className="ck-csl-editor-cards"
					style={
						layout === 'grid'
							? { display: 'grid', gridTemplateColumns: `repeat(${previewCount}, 1fr)`, gap: spaceBetween + 'px' }
							: layout === 'inline'
							? { display: 'flex', flexWrap: 'nowrap', gap: spaceBetween + 'px', overflowX: 'auto' }
							: { display: 'flex', gap: spaceBetween + 'px', overflow: 'hidden', alignItems: 'stretch' }
					}
				>
					{ previewCats.map( ( cat ) => {
						const cardWidth = layout === 'inline'
							? '200px'
							: `calc(${100 / previewCount}% - ${spaceBetween * ( previewCount - 1 ) / previewCount}px)`;
						const base = cardBaseStyle( cardWidth );

						/* ── Overlay positions ─────────────────────────────── */
						if ( isOverlay ) {
							const detailsPos =
								contentPosition === 'overlay_top'    ? { top: 0, left: 0, right: 0 }
								: contentPosition === 'overlay_middle' ? { top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' }
								: contentPosition === 'overlay_box'    ? { inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }
								: { bottom: 0, left: 0, right: 0 }; // overlay (bottom)

							return (
								<div key={ cat.id } className="ck-csl-editor-card"
									style={{ ...base, position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
									{ showThumbnail && renderThumb( cat ) }
									<div style={{ position: 'absolute', inset: 0, background: overlayBgColor, zIndex: 1, pointerEvents: 'none' }} />
									<div style={{ position: 'absolute', zIndex: 2, padding: `${contentPadTop}px ${contentPadRight}px ${contentPadBottom}px ${contentPadLeft}px`, ...detailsPos }}>
										{ renderContent( cat, '#ffffff' ) }
									</div>
								</div>
							);
						}

						/* ── Left / Right of thumbnail ─────────────────────── */
						if ( isSide ) {
							return (
								<div key={ cat.id } className="ck-csl-editor-card"
									style={{ ...base, display: 'flex', flexDirection: isLeft ? 'row-reverse' : 'row', alignItems: 'stretch', overflow: 'hidden', borderRadius: 4, background: '#fff' }}>
									{ showThumbnail && renderThumb( cat,
										{ width: '45%', flexShrink: 0, alignSelf: 'stretch' },
										{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
									) }
									<div style={{ flex: 1, padding: `${contentPadTop}px ${contentPadRight}px ${contentPadBottom}px ${contentPadLeft}px` }}>
										{ renderContent( cat ) }
									</div>
								</div>
							);
						}

						/* ── Above thumbnail ───────────────────────────────── */
						if ( isAbove ) {
							return (
								<div key={ cat.id } className="ck-csl-editor-card"
									style={{ ...base, display: 'flex', flexDirection: 'column' }}>
									<div style={{ flexShrink: 0, padding: `${contentPadTop}px ${contentPadRight}px ${contentPadBottom}px ${contentPadLeft}px` }}>
										{ renderContent( cat ) }
									</div>
									{ showThumbnail && renderThumb( cat,
										{ flex: '1 1 auto', minHeight: 120 },
										{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
									) }
								</div>
							);
						}

						/* ── Below thumbnail (default) ─────────────────────── */
						return (
							<div key={ cat.id } className="ck-csl-editor-card"
								style={{ ...base, display: 'flex', flexDirection: 'column' }}>
								{ showThumbnail && renderThumb( cat,
									{ marginBottom: thumbMarginBottom ? thumbMarginBottom + 'px' : 0 }
								) }
								<div style={{ flex: 1, padding: `${contentPadTop}px ${contentPadRight}px ${contentPadBottom}px ${contentPadLeft}px` }}>
									{ renderContent( cat ) }
								</div>
							</div>
						);
					} ) }
				</div>
			) }

			<div className="ck-csl-editor-hint">
				{ categories.length > previewCount
					? `${ __( 'Showing', 'commerce-kit' ) } ${ previewCount } ${ __( 'of', 'commerce-kit' ) } ${ categories.length } ${ __( 'categories. Full layout renders on the front-end.', 'commerce-kit' ) }`
					: layout === 'grid'
					? __( 'Front-end renders a static responsive CSS grid.', 'commerce-kit' )
					: layout === 'inline'
					? __( 'Front-end renders a horizontally scrollable row.', 'commerce-kit' )
					: __( 'Front-end renders the full Swiper carousel with all configured settings.', 'commerce-kit' )
				}
			</div>
		</div>
	);
};

export default Preview;
