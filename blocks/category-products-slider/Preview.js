import { Spinner } from '@wordpress/components';
import { __ }     from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';

// ─── Navigation button with hover state ──────────────────────────────────────
const NavBtn = ({
	isPrev, iconStyle, size,
	color, bgColor, borderColor, borderRadius,
	hoverColor, hoverBgColor, hoverBorderColor,
	onClick, disabled,
}) => {
	const [ hov, setHov ] = useState( false );
	const s   = Math.min( 3, Math.max( 1, iconStyle || 1 ) );
	const dim = Math.round( ( size || 22 ) * 1.8 );

	const btnStyle = {
		width: dim, height: dim,
		display: 'flex', alignItems: 'center', justifyContent: 'center',
		cursor:     disabled ? 'default' : 'pointer',
		color:      hov ? hoverColor      : color,
		background: hov ? hoverBgColor    : bgColor,
		border:     `1px solid ${ hov ? hoverBorderColor : borderColor }`,
		borderRadius: ( borderRadius || 0 ) + 'px',
		transition: 'all 0.2s',
		opacity:    disabled ? 0.4 : 1,
		flexShrink: 0,
		userSelect: 'none',
		pointerEvents: 'auto',
	};

	const icon = () => {
		if ( s === 1 ) return isPrev
			? <polyline points="15 18 9 12 15 6"/>
			: <polyline points="9 18 15 12 9 6"/>;

		if ( s === 2 ) return isPrev ? (
			<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>
		) : (
			<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
		);

		return isPrev ? (
			<><circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/></>
		) : (
			<><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></>
		);
	};

	return (
		<div
			style={ btnStyle }
			onMouseEnter={ () => setHov( true ) }
			onMouseLeave={ () => setHov( false ) }
			onClick={ disabled ? undefined : onClick }
			role="button"
			aria-label={ isPrev ? __( 'Previous', 'commerce-kit' ) : __( 'Next', 'commerce-kit' ) }
		>
			<svg
				width={ size || 22 } height={ size || 22 }
				viewBox="0 0 24 24" fill="none" stroke="currentColor"
				strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
			>
				{ icon() }
			</svg>
		</div>
	);
};

// ─── Pagination indicator ─────────────────────────────────────────────────────
const Pager = ({ type, total, current, color, activeColor }) => {
	if ( total <= 1 ) return null;

	if ( type === 'fraction' ) {
		return (
			<div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: activeColor, marginTop: 14, lineHeight: 1 }}>
				{ current + 1 }&thinsp;/&thinsp;{ total }
			</div>
		);
	}

	if ( type === 'progressbar' ) {
		const pct = Math.round( ( ( current + 1 ) / total ) * 100 );
		return (
			<div style={{ marginTop: 14, height: 4, background: color, borderRadius: 2, overflow: 'hidden' }}>
				<div style={{ width: pct + '%', height: '100%', background: activeColor, borderRadius: 2, transition: 'width 0.3s ease' }} />
			</div>
		);
	}

	// bullets / dynamic
	const isDynamic = type === 'dynamic';
	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
			{ Array.from( { length: total } ).map( ( _, i ) => {
				const active = i === current;
				const near   = isDynamic && Math.abs( i - current ) === 1;
				const sz     = active ? 10 : ( near ? 8 : 6 );
				return (
					<div key={ i } style={{
						width: sz, height: sz, borderRadius: '50%',
						background: active ? activeColor : color,
						transition: 'all 0.25s', flexShrink: 0,
					}} />
				);
			} ) }
		</div>
	);
};

// ─── Main Preview ─────────────────────────────────────────────────────────────
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
		// Slider controls
		autoplay, autoplaySpeed, scrollSpeed, slidesToScroll,
		pauseOnHover, infiniteLoop, rtlDirection,
		// Navigation
		showNavigation, navHideOnMobile, navPosition, navIconStyle, navIconSize,
		navColor, navHoverColor, navBgColor, navHoverBgColor,
		navBorderColor, navHoverBorderColor, navBorderRadius,
		// Pagination
		showSliderPagination, sliderPaginationType, paginationColor, paginationActiveColor,
	} = attributes;

	const isSliderLayout = layout === 'carousel' || layout === 'slider';
	const isAbove   = contentPosition === 'above';
	const isLeft    = contentPosition === 'left';
	const isRight   = contentPosition === 'right';
	const isSide    = isLeft || isRight;
	const isOverlay = [ 'overlay', 'overlay_top', 'overlay_middle', 'overlay_box' ].includes( contentPosition );

	// ── Slider state (declared unconditionally to satisfy Rules of Hooks) ──
	const [ currentSlide, setCurrentSlide ] = useState( 0 );
	const [ isPaused,     setIsPaused     ] = useState( false );
	const pauseRef = useRef( false );
	const slideRef = useRef( 0 );

	useEffect( () => { pauseRef.current = isPaused; }, [ isPaused ] );
	useEffect( () => { slideRef.current = currentSlide; }, [ currentSlide ] );

	const slidesPerView = ! isSliderLayout ? ( colDesktop || 3 )
		: layout === 'slider'
		? 1
		: Math.min( colDesktop || 3, Math.max( 1, categories.length ) );

	const gap      = spaceBetween || 20;
	const maxSlide = Math.max( 0, categories.length - slidesPerView );
	const canSlide = categories.length > slidesPerView;

	// Reset to first slide when the category list changes
	useEffect( () => { setCurrentSlide( 0 ); }, [ categories.length ] );

	const scroll = ( dir ) => {
		const step = Math.max( 1, slidesToScroll || 1 );
		setCurrentSlide( prev => {
			if ( dir === 'next' ) {
				const n = prev + step;
				return n > maxSlide ? ( infiniteLoop ? 0 : maxSlide ) : n;
			}
			const p = prev - step;
			return p < 0 ? ( infiniteLoop ? maxSlide : 0 ) : p;
		} );
	};

	// Autoplay — reads currentSlide from ref to avoid stale-closure issues
	useEffect( () => {
		if ( ! isSliderLayout || ! autoplay || ! canSlide ) return;
		const delay = Math.max( 500, autoplaySpeed || 3000 );
		const t = setInterval( () => {
			if ( pauseRef.current ) return;
			const cur  = slideRef.current;
			const step = Math.max( 1, slidesToScroll || 1 );
			const next = cur + step;
			setCurrentSlide( next > maxSlide ? ( infiniteLoop ? 0 : cur ) : next );
		}, delay );
		return () => clearInterval( t );
	}, [ isSliderLayout, autoplay, autoplaySpeed, slidesToScroll, maxSlide, infiniteLoop, canSlide ] );

	// ── Card rendering helpers ─────────────────────────────────────────────
	const thumbBr = thumbnailShape === 'circle'  ? '50%'
		          : thumbnailShape === 'rounded' ? '8px'
		          : thumbnailRadius > 0           ? thumbnailRadius + 'px'
		          : '0';

	const thumbWrapBase = {
		overflow: 'hidden', position: 'relative',
		borderRadius: thumbBr,
		border:    showThumbBorder ? `${ thumbBorderWidth }px ${ thumbBorderStyle } ${ thumbBorderColor }` : 'none',
		boxShadow: showBoxShadow   ? `${ boxShadowH }px ${ boxShadowV }px ${ boxShadowBlur }px ${ boxShadowSpread }px ${ boxShadowColor }` : 'none',
		padding:   thumbInnerPad   ? thumbInnerPad + 'px' : 0,
		background: '#f0f0f0',
		lineHeight: 0,
		filter:    imageMode === 'grayscale' ? 'grayscale(100%)' : 'none',
	};

	const zoomStyle = thumbnailZoom === 'zoom_out'
		? { transform: 'scale(1.1)', transition: 'transform 0.4s ease' }
		: thumbnailZoom === 'zoom_in'
		? { transition: 'transform 0.4s ease' }
		: {};

	const PlaceholderImg = () => (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', aspectRatio: '1' }}>
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
				<rect x="3" y="3" width="18" height="18" rx="2"/>
				<circle cx="8.5" cy="8.5" r="1.5"/>
				<polyline points="21 15 16 10 5 21"/>
			</svg>
		</div>
	);

	const renderThumb = ( cat, extraWrapStyle = {}, imgStyle = { width: '100%', display: 'block' } ) => {
		const src = cat.image && cat.image.src
			? cat.image.src
			: ( useCustomPlaceholder && customPlaceholderUrl ? customPlaceholderUrl : null );
		const alt = cat.image && cat.image.alt ? cat.image.alt : cat.name;
		return (
			<div style={{ ...thumbWrapBase, ...extraWrapStyle }}>
				{ src
					? <img src={ src } alt={ alt } style={{ ...imgStyle, borderRadius: thumbBr, ...zoomStyle }} />
					: <PlaceholderImg />
				}
				{ imageMode === 'custom_color' && (
					<div style={{ position: 'absolute', inset: 0, background: imageCustomColor || '#cc0000', mixBlendMode: 'multiply', pointerEvents: 'none' }} />
				) }
			</div>
		);
	};

	const renderContent = ( cat, overrideColor = null ) => {
		const desc      = ( cat.description || '' ).replace( /<[^>]+>/g, '' );
		const nameColor = overrideColor || catNameColor;
		const cntColor  = overrideColor || countColor;
		const custColor = overrideColor || customTextColor;
		const dscColor  = overrideColor || descColor;
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

	const renderCard = ( cat ) => {
		if ( isOverlay ) {
			const detailsPos =
				contentPosition === 'overlay_top'    ? { top: 0, left: 0, right: 0 }
				: contentPosition === 'overlay_middle' ? { top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' }
				: contentPosition === 'overlay_box'    ? { inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }
				: { bottom: 0, left: 0, right: 0 };
			return (
				<div style={{ position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
					{ showThumbnail && renderThumb( cat ) }
					<div style={{ position: 'absolute', inset: 0, background: overlayBgColor, zIndex: 1, pointerEvents: 'none' }} />
					<div style={{ position: 'absolute', zIndex: 2, padding: `${ contentPadTop }px ${ contentPadRight }px ${ contentPadBottom }px ${ contentPadLeft }px`, ...detailsPos }}>
						{ renderContent( cat, '#ffffff' ) }
					</div>
				</div>
			);
		}

		if ( isSide ) {
			return (
				<div style={{ display: 'flex', flexDirection: isLeft ? 'row-reverse' : 'row', alignItems: 'stretch', overflow: 'hidden', borderRadius: 4, background: '#fff' }}>
					{ showThumbnail && renderThumb( cat,
						{ width: '45%', flexShrink: 0, alignSelf: 'stretch' },
						{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
					) }
					<div style={{ flex: 1, padding: `${ contentPadTop }px ${ contentPadRight }px ${ contentPadBottom }px ${ contentPadLeft }px` }}>
						{ renderContent( cat ) }
					</div>
				</div>
			);
		}

		if ( isAbove ) {
			return (
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div style={{ flexShrink: 0, padding: `${ contentPadTop }px ${ contentPadRight }px ${ contentPadBottom }px ${ contentPadLeft }px` }}>
						{ renderContent( cat ) }
					</div>
					{ showThumbnail && renderThumb( cat,
						{ flex: '1 1 auto', minHeight: 120 },
						{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
					) }
				</div>
			);
		}

		// Below thumbnail (default)
		return (
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{ showThumbnail && renderThumb( cat,
					{ marginBottom: thumbMarginBottom ? thumbMarginBottom + 'px' : 0 }
				) }
				<div style={{ flex: 1, padding: `${ contentPadTop }px ${ contentPadRight }px ${ contentPadBottom }px ${ contentPadLeft }px` }}>
					{ renderContent( cat ) }
				</div>
			</div>
		);
	};

	// ── Slider render ──────────────────────────────────────────────────────
	//
	// After the RTL fix:
	//   rtlDirection=true  → standard right-to-left animation (nav: prev left, next right)
	//   rtlDirection=false → reversed left-to-right animation (nav: row-reverse, cats reversed)
	//
	// Track translate: pitch per slide = (containerWidth + gap) / slidesPerView
	//   translateX = -currentSlide * pitch
	//             = -(currentSlide * 100/n)%  - (currentSlide * gap/n)px

	const slideWidthPct = 100 / slidesPerView;
	const gapPerSlide   = gap * ( slidesPerView - 1 ) / slidesPerView;
	const translatePct  = currentSlide * slideWidthPct;
	const translatePx   = currentSlide * gap / slidesPerView;

	// For reversed direction: show categories in reverse order so "next" enters from the left
	const displayCats = rtlDirection ? categories : [ ...categories ].reverse();

	// Nav bar: standard → row (← left, → right); reversed → row-reverse (→ left, ← right)
	const navFlexDir = rtlDirection ? 'row' : 'row-reverse';

	const pagerTotal = Math.max( 1, maxSlide + 1 );

	const renderSlider = () => (
		<div
			style={{ position: 'relative' }}
			onMouseEnter={ () => { if ( pauseOnHover ) setIsPaused( true  ); } }
			onMouseLeave={ () => { if ( pauseOnHover ) setIsPaused( false ); } }
		>
			{/* ── Slide viewport ── */}
			<div style={{ overflow: 'hidden', position: 'relative' }}>
				<div style={{
					display: 'flex',
					gap: gap + 'px',
					transform: `translateX(calc(-${ translatePct.toFixed( 4 ) }% - ${ translatePx.toFixed( 4 ) }px))`,
					transition: `transform ${ scrollSpeed || 600 }ms ease`,
					alignItems: 'stretch',
				}}>
					{ displayCats.map( ( cat ) => (
						<div key={ cat.id } style={{
							flex: `0 0 calc(${ slideWidthPct.toFixed( 4 ) }% - ${ gapPerSlide.toFixed( 4 ) }px)`,
							minWidth: 0,
						}}>
							{ renderCard( cat ) }
						</div>
					) ) }
				</div>
			</div>

			{/* ── Navigation arrows ── */}
			{ showNavigation && canSlide && (
				<div style={{
					display: 'flex',
					flexDirection: navFlexDir,
					justifyContent: 'space-between',
					alignItems: 'center',
					position: 'absolute',
					top: '50%',
					transform: 'translateY(-50%)',
					left: 6,
					right: 6,
					pointerEvents: 'none',
					zIndex: 5,
				}}>
					<NavBtn
						isPrev={ true }
						iconStyle={ navIconStyle }
						size={ navIconSize || 22 }
						color={ navColor }           bgColor={ navBgColor }           borderColor={ navBorderColor }
						hoverColor={ navHoverColor } hoverBgColor={ navHoverBgColor } hoverBorderColor={ navHoverBorderColor }
						borderRadius={ navBorderRadius }
						onClick={ () => scroll( 'prev' ) }
						disabled={ ! infiniteLoop && currentSlide === 0 }
					/>
					<NavBtn
						isPrev={ false }
						iconStyle={ navIconStyle }
						size={ navIconSize || 22 }
						color={ navColor }           bgColor={ navBgColor }           borderColor={ navBorderColor }
						hoverColor={ navHoverColor } hoverBgColor={ navHoverBgColor } hoverBorderColor={ navHoverBorderColor }
						borderRadius={ navBorderRadius }
						onClick={ () => scroll( 'next' ) }
						disabled={ ! infiniteLoop && currentSlide === maxSlide }
					/>
				</div>
			) }

			{/* ── Pagination ── */}
			{ showSliderPagination && canSlide && (
				<Pager
					type={ sliderPaginationType }
					total={ pagerTotal }
					current={ currentSlide }
					color={ paginationColor }
					activeColor={ paginationActiveColor }
				/>
			) }

			{/* ── Status badges ── */}
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
				{ autoplay && (
					<span style={{
						fontSize: 11, padding: '2px 8px', borderRadius: 3,
						background: isPaused ? '#f5f5f5'  : '#e6f3ff',
						color:      isPaused ? '#999'     : '#0073aa',
						border:     `1px solid ${ isPaused ? '#ddd' : '#b8d9f5' }`,
					}}>
						{ isPaused
							? __( '⏸ Autoplay paused', 'commerce-kit' )
							: `▶ ${ __( 'Autoplay', 'commerce-kit' ) } — ${ autoplaySpeed || 3000 }ms`
						}
					</span>
				) }
				{ ! autoplay && (
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f5f5f5', color: '#888', border: '1px solid #ddd' }}>
						{ __( '⏹ Autoplay off', 'commerce-kit' ) }
					</span>
				) }
				{ ! rtlDirection && (
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
						{ __( '↔ Reversed direction', 'commerce-kit' ) }
					</span>
				) }
				{ navHideOnMobile && (
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }}>
						{ __( '📱 Nav hidden on mobile', 'commerce-kit' ) }
					</span>
				) }
				{ ! infiniteLoop && (
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f5f5f5', color: '#888', border: '1px solid #ddd' }}>
						{ __( 'Loop off', 'commerce-kit' ) }
					</span>
				) }
			</div>
		</div>
	);

	// ── Non-slider card layout ─────────────────────────────────────────────
	const previewCount = Math.min( colDesktop || 3, 4 );
	const previewCats  = categories.slice( 0, previewCount );

	const renderStaticGrid = () => (
		<div
			className="ck-csl-editor-cards"
			style={
				layout === 'grid'
					? { display: 'grid', gridTemplateColumns: `repeat(${ previewCount }, 1fr)`, gap: gap + 'px' }
					: { display: 'flex', flexWrap: 'nowrap', gap: gap + 'px', overflowX: 'auto' }
			}
		>
			{ previewCats.map( ( cat ) => {
				const cardWidth = layout === 'inline'
					? '200px'
					: `calc(${ 100 / previewCount }% - ${ gap * ( previewCount - 1 ) / previewCount }px)`;
				const base = layout === 'grid'
					? { minWidth: 0 }
					: { flex: `0 0 ${ cardWidth }`, minWidth: 0 };

				return (
					<div key={ cat.id } className="ck-csl-editor-card" style={ base }>
						{ renderCard( cat ) }
					</div>
				);
			} ) }
		</div>
	);

	// ── Hint line ─────────────────────────────────────────────────────────
	const hintText = isSliderLayout
		? ( canSlide
			? `${ __( 'Showing', 'commerce-kit' ) } ${ slidesPerView } ${ __( 'of', 'commerce-kit' ) } ${ categories.length } ${ __( 'categories. Use arrows to navigate.', 'commerce-kit' ) }`
			: __( 'Full layout renders on the front-end.', 'commerce-kit' )
		  )
		: ( categories.length > previewCount
			? `${ __( 'Showing', 'commerce-kit' ) } ${ previewCount } ${ __( 'of', 'commerce-kit' ) } ${ categories.length } ${ __( 'categories. Full layout renders on the front-end.', 'commerce-kit' ) }`
			: layout === 'grid'
			? __( 'Front-end renders a static responsive CSS grid.', 'commerce-kit' )
			: __( 'Front-end renders a horizontally scrollable row.', 'commerce-kit' )
		  );

	// ── Outer render ──────────────────────────────────────────────────────
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

			{ ! isLoading && fetchError && (
				<div style={{ padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, fontSize: 13, color: '#856404' }}>
					{ __( 'Could not load categories. Make sure WooCommerce is active and you are logged in as an administrator.', 'commerce-kit' ) }
				</div>
			) }

			{ ! isLoading && ! fetchError && categories.length === 0 && (
				<div style={{ padding: '12px 16px', background: '#f0f0f0', borderRadius: 4, fontSize: 13, color: '#555' }}>
					{ __( 'No categories found with the current settings.', 'commerce-kit' ) }
				</div>
			) }

			{ ! isLoading && ! fetchError && categories.length > 0 && (
				isSliderLayout ? renderSlider() : renderStaticGrid()
			) }

			{ ! isLoading && ! fetchError && categories.length > 0 && (
				<div className="ck-csl-editor-hint">{ hintText }</div>
			) }

		</div>
	);
};

export default Preview;
