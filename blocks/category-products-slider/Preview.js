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
	const s   = Math.min( 6, Math.max( 1, iconStyle || 1 ) );
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

		if ( s === 3 ) return isPrev ? (
			<><circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/></>
		) : (
			<><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></>
		);

		if ( s === 4 ) return isPrev
			? <polyline points="17 4 7 12 17 20"/>
			: <polyline points="7 4 17 12 7 20"/>;

		if ( s === 5 ) return isPrev ? (
			<><polyline points="18 5 11 12 18 19"/><polyline points="12 5 5 12 12 19"/></>
		) : (
			<><polyline points="6 5 13 12 6 19"/><polyline points="12 5 19 12 12 19"/></>
		);

		// s === 6 — boxed arrow
		return isPrev ? (
			<><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="14 8 8 12 14 16"/></>
		) : (
			<><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="10 8 16 12 10 16"/></>
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

	if ( type === 'numbered' ) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 14, flexWrap: 'wrap' }}>
				{ Array.from( { length: total } ).map( ( _, i ) => {
					const active = i === current;
					return (
						<div key={ i } style={{
							width: 22, height: 22, borderRadius: '50%',
							border: `1px solid ${ active ? activeColor : color }`,
							background: active ? activeColor : 'transparent',
							display: 'flex', alignItems: 'center', justifyContent: 'center',
							fontSize: 10, fontWeight: 700, lineHeight: 1,
							color: active ? '#fff' : color,
							transition: 'all 0.2s',
						}}>
							{ i + 1 }
						</div>
					);
				} ) }
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

// ─── Grid pagination number range, with ellipsis (mirrors the PHP front-end logic) ──
const paginateNumbers = ( current, total ) => {
	const range = [];
	for ( let i = 1; i <= total; i++ ) {
		if ( i === 1 || i === total || Math.abs( i - current ) <= 2 ) {
			range.push( i );
		} else if ( range[ range.length - 1 ] !== '...' ) {
			range.push( '...' );
		}
	}
	return range;
};

const gridPageBtnStyle = ( active, disabled ) => ({
	minWidth: 28, height: 28, padding: '0 6px',
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
	fontSize: 12, fontWeight: active ? 700 : 500,
	color:      active ? '#fff' : ( disabled ? '#bbb' : '#333' ),
	background: active ? '#cc2b5e' : '#fff',
	border: `1px solid ${ active ? '#cc2b5e' : '#ddd' }`,
	borderRadius: 4,
	cursor: disabled ? 'default' : 'pointer',
	opacity: disabled ? 0.5 : 1,
});

// ─── Main Preview ─────────────────────────────────────────────────────────────
const Preview = ({ attributes, categories, isLoading, fetchError }) => {
	const {
		layout, carouselStyle, sliderStyle, colDesktop, spaceBetween,
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
		// Grid pagination
		gridPaginationType, gridItemsPerPage,
	} = attributes;

	const isSliderLayout   = layout === 'carousel' || layout === 'slider';
	const effectiveCarouselStyle = layout === 'carousel' ? ( carouselStyle || 'standard' ) : 'standard';
	const effectiveSliderStyle   = layout === 'slider'   ? ( sliderStyle   || 'slide' )    : 'slide';
	const isTicker    = effectiveCarouselStyle === 'ticker';
	const isKenburns  = effectiveSliderStyle === 'kenburns';
	// Flip/Cube only support a single visible slide (Swiper enforces this); Coverflow
	// and Slide keep the configured Columns per Breakpoint, same as Carousel.
	const is3DSlider  = [ 'flip', 'cube' ].includes( effectiveSliderStyle );
	const isCoverflow = effectiveSliderStyle === 'coverflow';
	const isFade      = effectiveCarouselStyle === 'fade' || effectiveSliderStyle === 'fade' || isKenburns;
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
	const [ tickerId ] = useState( () => 'ck-tick-' + Math.random().toString( 36 ).slice( 2 ) );
	const [ gridPage,  setGridPage ] = useState( 1 );

	useEffect( () => { pauseRef.current = isPaused; }, [ isPaused ] );
	useEffect( () => { slideRef.current = currentSlide; }, [ currentSlide ] );

	const slidesPerView = ! isSliderLayout ? ( colDesktop || 3 )
		: ( isFade || is3DSlider )
		? 1
		: Math.min( colDesktop || 3, Math.max( 1, categories.length ) );

	const gap      = spaceBetween || 20;
	const maxSlide = Math.max( 0, categories.length - slidesPerView );
	const canSlide = categories.length > slidesPerView;

	// Reset to first slide when the category list changes
	useEffect( () => { setCurrentSlide( 0 ); }, [ categories.length ] );

	const scroll = ( dir ) => {
		const step = isFade ? 1 : Math.max( 1, slidesToScroll || 1 );
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
		if ( ! isSliderLayout || isTicker || ! autoplay || ! canSlide ) return;
		const delay = Math.max( 500, autoplaySpeed || 3000 );
		const t = setInterval( () => {
			if ( pauseRef.current ) return;
			const cur  = slideRef.current;
			const step = isFade ? 1 : Math.max( 1, slidesToScroll || 1 );
			const next = cur + step;
			setCurrentSlide( next > maxSlide ? ( infiniteLoop ? 0 : cur ) : next );
		}, delay );
		return () => clearInterval( t );
	}, [ isSliderLayout, isTicker, isFade, autoplay, autoplaySpeed, slidesToScroll, maxSlide, infiniteLoop, canSlide ] );

	// ── Card rendering helpers ─────────────────────────────────────────────
	const thumbBr = thumbnailShape === 'circle'  ? '50%'
		          : thumbnailShape === 'rounded' ? '8px'
		          : thumbnailRadius > 0           ? thumbnailRadius + 'px'
		          : '0';

	const thumbWrapBase = {
		overflow: 'hidden', position: 'relative',
		// Static square box by default so mixed portrait/landscape/logo images
		// line up instead of pushing card heights apart. Positions that derive
		// their height from flex layout (left/right, above) opt back out via
		// extraWrapStyle below.
		aspectRatio: '1',
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

	const renderThumb = ( cat, extraWrapStyle = {}, imgStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } ) => {
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
						{ aspectRatio: 'auto', width: '45%', flexShrink: 0, alignSelf: 'stretch' },
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
						{ aspectRatio: 'auto', flex: '1 1 auto', minHeight: 120 },
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
	//   rtlDirection=false (default) → standard left-to-right (nav: prev left, next right)
	//   rtlDirection=true            → reversed right-to-left (nav: row-reverse, cats reversed)
	//
	// Track translate: pitch per slide = (containerWidth + gap) / slidesPerView
	//   translateX = -currentSlide * pitch
	//             = -(currentSlide * 100/n)%  - (currentSlide * gap/n)px

	const slideWidthPct = 100 / slidesPerView;
	const gapPerSlide   = gap * ( slidesPerView - 1 ) / slidesPerView;
	const translatePct  = currentSlide * slideWidthPct;
	const translatePx   = currentSlide * gap / slidesPerView;

	// For reversed direction: show categories in reverse order so "next" enters from the left
	const displayCats = rtlDirection ? [ ...categories ].reverse() : categories;

	// Nav bar: standard → row (← left, → right); reversed → row-reverse (→ left, ← right)
	const navFlexDir = rtlDirection ? 'row-reverse' : 'row';

	const pagerTotal = Math.max( 1, maxSlide + 1 );

	// ── Nav position helpers ──────────────────────────────────────────────────
	const navPos        = navPosition || 'top-right';
	const navIsVertical = navPos.startsWith( 'vertical' );
	const navIsBottom   = navPos.startsWith( 'bottom' );
	const navIsTop      = ! navIsVertical && ! navIsBottom;
	const navAlign      = navPos.endsWith( 'right'  ) ? 'flex-end'
	                    : navPos.endsWith( 'center' ) ? 'center'
	                    : 'flex-start';

	// Space reserved for top/bottom nav (button height + gap)
	const btnDim     = Math.round( ( navIconSize || 22 ) * 1.8 );
	const navPadding = navIsVertical ? 0 : btnDim + 10;

	// Horizontal inset for vertical variants
	const navInset = navPos === 'vertical-outer' ? -( btnDim + 4 )
	               : navPos === 'vertical-inner'  ? 6
	               : 0;

	const navStyle = navIsVertical ? {
		// Vertical: centered over the slide area
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		left: navInset,
		right: navInset,
		display: 'flex',
		flexDirection: navFlexDir,
		justifyContent: 'space-between',
		alignItems: 'center',
		pointerEvents: 'none',
		zIndex: 5,
	} : navIsBottom ? {
		// Bottom: pinned to bottom of the padded wrapper
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: btnDim,
		display: 'flex',
		justifyContent: navAlign,
		alignItems: 'center',
		gap: 6,
		pointerEvents: 'none',
		zIndex: 5,
	} : {
		// Top: pinned to top of the padded wrapper
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: btnDim,
		display: 'flex',
		justifyContent: navAlign,
		alignItems: 'center',
		gap: 6,
		pointerEvents: 'none',
		zIndex: 5,
	};

	// ── Fade: crossfades a single category at a time ───────────────────────
	const kenburnsDuration = Math.max( 1000, ( autoplaySpeed || 3000 ) + ( scrollSpeed || 600 ) );

	const renderFadeSlider = () => (
		<div
			style={{
				position: 'relative',
				paddingTop:    navIsTop    ? navPadding : 0,
				paddingBottom: navIsBottom ? navPadding : 0,
				overflow: navPos === 'vertical-outer' ? 'visible' : undefined,
			}}
			onMouseEnter={ () => { if ( pauseOnHover ) setIsPaused( true  ); } }
			onMouseLeave={ () => { if ( pauseOnHover ) setIsPaused( false ); } }
		>
			{ isKenburns && (
				<style>{ `@keyframes ${ tickerId }-kb { from { transform: scale(1); } to { transform: scale(1.15); } }` }</style>
			) }

			{ showNavigation && canSlide && (
				<div style={ navStyle }>
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

			<div style={{ position: 'relative', overflow: isKenburns ? 'hidden' : undefined }}>
				{ categories.map( ( cat, i ) => (
					<div key={ cat.id } style={
						i === currentSlide
							? { position: 'relative', opacity: 1, transition: `opacity ${ scrollSpeed || 600 }ms ease` }
							: { position: 'absolute', inset: 0, opacity: 0, transition: `opacity ${ scrollSpeed || 600 }ms ease`, pointerEvents: 'none' }
					}>
						{ isKenburns ? (
							<div style={{
								animationName: i === currentSlide ? `${ tickerId }-kb` : 'none',
								animationDuration: kenburnsDuration + 'ms',
								animationTimingFunction: 'ease-out',
								animationFillMode: 'forwards',
							}}>
								{ renderCard( cat ) }
							</div>
						) : renderCard( cat ) }
					</div>
				) ) }
			</div>

			{ showSliderPagination && canSlide && (
				<Pager
					type={ sliderPaginationType }
					total={ pagerTotal }
					current={ currentSlide }
					color={ paginationColor }
					activeColor={ paginationActiveColor }
				/>
			) }

			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
				<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#eef2ff', color: '#4361ee', border: '1px solid #c7d2fe' }}>
					{ isKenburns
						? __( '🎞 Ken Burns — crossfade with a slow zoom', 'commerce-kit' )
						: __( '⤢ Fade — crossfades one category at a time', 'commerce-kit' )
					}
				</span>
				{ autoplay ? (
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
				) : (
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f5f5f5', color: '#888', border: '1px solid #ddd' }}>
						{ __( '⏹ Autoplay off', 'commerce-kit' ) }
					</span>
				) }
			</div>
		</div>
	);

	// ── Ticker: continuous, non-stop auto-scroll (no snapping) ─────────────
	const renderTickerSlider = () => {
		const durationMs = Math.max( 1000, scrollSpeed || 600 ) * 8;
		const trackCats  = [ ...categories, ...categories ];
		const cardWidth  = Math.max( 140, Math.round( 720 / ( colDesktop || 3 ) ) );

		return (
			<div
				style={{ position: 'relative', overflow: 'hidden' }}
				onMouseEnter={ () => { if ( pauseOnHover ) setIsPaused( true  ); } }
				onMouseLeave={ () => { if ( pauseOnHover ) setIsPaused( false ); } }
			>
				<style>{ `@keyframes ${ tickerId } { from { transform: translateX(0); } to { transform: translateX(-50%); } }` }</style>
				<div style={{
					display: 'flex',
					gap: gap + 'px',
					width: 'max-content',
					animationName: tickerId,
					animationDuration: durationMs + 'ms',
					animationTimingFunction: 'linear',
					animationIterationCount: 'infinite',
					animationDirection: rtlDirection ? 'reverse' : 'normal',
					animationPlayState: ( autoplay && ! isPaused ) ? 'running' : 'paused',
				}}>
					{ trackCats.map( ( cat, i ) => (
						<div key={ i } style={{ flex: `0 0 ${ cardWidth }px`, minWidth: 0 }}>
							{ renderCard( cat ) }
						</div>
					) ) }
				</div>

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#e8f8ee', color: '#1a7f4e', border: '1px solid #b7ebc9' }}>
						{ __( '➰ Ticker — continuous auto-scroll, no arrows or pagination', 'commerce-kit' ) }
					</span>
					{ ! autoplay && (
						<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f5f5f5', color: '#888', border: '1px solid #ddd' }}>
							{ __( '⏹ Autoplay off — ticker paused', 'commerce-kit' ) }
						</span>
					) }
				</div>
			</div>
		);
	};

	const renderStandardSlider = () => {
		return (
			<div
				style={{
					position: 'relative',
					paddingTop:    navIsTop    ? navPadding : 0,
					paddingBottom: navIsBottom ? navPadding : 0,
					overflow: navPos === 'vertical-outer' ? 'visible' : undefined,
				}}
				onMouseEnter={ () => { if ( pauseOnHover ) setIsPaused( true  ); } }
				onMouseLeave={ () => { if ( pauseOnHover ) setIsPaused( false ); } }
			>
				{/* ── Navigation (all positions, absolutely placed) ── */}
				{ showNavigation && canSlide && (
					<div style={ navStyle }>
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
					{ isCoverflow && (
						<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }}>
							{ __( '◪ Coverflow — 3D tilt renders on the front-end', 'commerce-kit' ) }
						</span>
					) }
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
					{ rtlDirection && (
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
	};

	// ── 3D styles (Coverflow / Flip / Cube): approximate the depth transform
	// with a perspective + rotateY crossfade; Swiper's real per-neighbour math
	// is reproduced on the frontend, this is a visual stand-in for the editor.
	const THREE_D_LABELS = {
		coverflow: __( '◪ Coverflow — side slides tilt away in perspective', 'commerce-kit' ),
		flip:      __( '🔄 Flip — slides flip over like a card', 'commerce-kit' ),
		cube:      __( '⬛ Cube — slides rotate like faces of a cube', 'commerce-kit' ),
	};
	const THREE_D_TRANSFORMS = {
		coverflow: { active: 'perspective(1000px) rotateY(0deg) scale(1)', inactive: 'perspective(1000px) rotateY(25deg) scale(0.85)' },
		flip:      { active: 'perspective(1000px) rotateY(0deg)',          inactive: 'perspective(1000px) rotateY(180deg)' },
		cube:      { active: 'perspective(1000px) rotateY(0deg)',          inactive: 'perspective(1000px) rotateY(90deg)' },
	};

	const render3DSlider = () => {
		const xf = THREE_D_TRANSFORMS[ effectiveSliderStyle ] || THREE_D_TRANSFORMS.coverflow;
		return (
			<div
				style={{
					position: 'relative',
					paddingTop:    navIsTop    ? navPadding : 0,
					paddingBottom: navIsBottom ? navPadding : 0,
				}}
				onMouseEnter={ () => { if ( pauseOnHover ) setIsPaused( true  ); } }
				onMouseLeave={ () => { if ( pauseOnHover ) setIsPaused( false ); } }
			>
				{ showNavigation && canSlide && (
					<div style={ navStyle }>
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

				<div style={{ position: 'relative' }}>
					{ categories.map( ( cat, i ) => (
						<div key={ cat.id } style={
							i === currentSlide
								? { position: 'relative', opacity: 1, transform: xf.active, transformStyle: 'preserve-3d', transition: `transform ${ scrollSpeed || 600 }ms ease, opacity ${ scrollSpeed || 600 }ms ease` }
								: { position: 'absolute', inset: 0, opacity: 0, transform: xf.inactive, transformStyle: 'preserve-3d', transition: `transform ${ scrollSpeed || 600 }ms ease, opacity ${ scrollSpeed || 600 }ms ease`, pointerEvents: 'none' }
						}>
							{ renderCard( cat ) }
						</div>
					) ) }
				</div>

				{ showSliderPagination && canSlide && (
					<Pager
						type={ sliderPaginationType }
						total={ pagerTotal }
						current={ currentSlide }
						color={ paginationColor }
						activeColor={ paginationActiveColor }
					/>
				) }

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
					<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }}>
						{ THREE_D_LABELS[ effectiveSliderStyle ] }
					</span>
					{ autoplay ? (
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
					) : (
						<span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: '#f5f5f5', color: '#888', border: '1px solid #ddd' }}>
							{ __( '⏹ Autoplay off', 'commerce-kit' ) }
						</span>
					) }
				</div>
			</div>
		);
	};

	const renderSlider = () => {
		if ( isFade )     return renderFadeSlider();
		if ( isTicker )   return renderTickerSlider();
		if ( is3DSlider ) return render3DSlider();
		return renderStandardSlider();
	};

	// ── Non-slider card layout ─────────────────────────────────────────────
	const previewCount   = Math.min( colDesktop || 3, 4 );
	const isPaginatedGrid = layout === 'grid' && gridPaginationType && gridPaginationType !== 'none';
	const perPage         = Math.max( 1, gridItemsPerPage || 6 );
	const totalGridPages  = isPaginatedGrid ? Math.max( 1, Math.ceil( categories.length / perPage ) ) : 1;
	const currentGridPage = Math.min( gridPage, totalGridPages );

	const previewCats = isPaginatedGrid
		? ( gridPaginationType === 'load-more'
			? categories.slice( 0, perPage * currentGridPage )
			: categories.slice( ( currentGridPage - 1 ) * perPage, currentGridPage * perPage ) )
		: categories.slice( 0, previewCount );

	const renderStaticGrid = () => (
		<>
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

			{ isPaginatedGrid && totalGridPages > 1 && gridPaginationType === 'load-more' && currentGridPage < totalGridPages && (
				<div style={{ textAlign: 'center', marginTop: 16 }}>
					<button
						type="button"
						onClick={ () => setGridPage( Math.min( totalGridPages, currentGridPage + 1 ) ) }
						style={ gridPageBtnStyle( false, false ) }
					>
						{ __( 'Load More', 'commerce-kit' ) }
					</button>
				</div>
			) }

			{ isPaginatedGrid && totalGridPages > 1 && gridPaginationType === 'numbered' && (
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
					<button type="button" disabled={ currentGridPage <= 1 } onClick={ () => setGridPage( 1 ) } style={ gridPageBtnStyle( false, currentGridPage <= 1 ) }>«</button>
					<button type="button" disabled={ currentGridPage <= 1 } onClick={ () => setGridPage( Math.max( 1, currentGridPage - 1 ) ) } style={ gridPageBtnStyle( false, currentGridPage <= 1 ) }>‹</button>
					{ paginateNumbers( currentGridPage, totalGridPages ).map( ( n, i ) => (
						n === '...' ? (
							<span key={ 'ellipsis-' + i } style={{ padding: '0 4px', color: '#999', fontSize: 12 }}>…</span>
						) : (
							<button
								key={ n }
								type="button"
								onClick={ () => setGridPage( n ) }
								style={ gridPageBtnStyle( n === currentGridPage, false ) }
							>
								{ n }
							</button>
						)
					) ) }
					<button type="button" disabled={ currentGridPage >= totalGridPages } onClick={ () => setGridPage( Math.min( totalGridPages, currentGridPage + 1 ) ) } style={ gridPageBtnStyle( false, currentGridPage >= totalGridPages ) }>›</button>
					<button type="button" disabled={ currentGridPage >= totalGridPages } onClick={ () => setGridPage( totalGridPages ) } style={ gridPageBtnStyle( false, currentGridPage >= totalGridPages ) }>»</button>
				</div>
			) }
		</>
	);

	// ── Hint line ─────────────────────────────────────────────────────────
	const hintText = isSliderLayout
		? ( isTicker
			? __( 'Categories scroll continuously in a loop — no arrows or pagination.', 'commerce-kit' )
			: isKenburns
			? __( 'Categories crossfade one at a time, with a slow zoom on the image.', 'commerce-kit' )
			: isFade
			? __( 'Categories crossfade one at a time.', 'commerce-kit' )
			: is3DSlider
			? __( 'Editor shows an approximate preview — the exact 3D effect renders on the front-end.', 'commerce-kit' )
			: canSlide
			? `${ __( 'Showing', 'commerce-kit' ) } ${ slidesPerView } ${ __( 'of', 'commerce-kit' ) } ${ categories.length } ${ __( 'categories. Use arrows to navigate.', 'commerce-kit' ) }`
			: __( 'Full layout renders on the front-end.', 'commerce-kit' )
		  )
		: isPaginatedGrid
		? `${ __( 'Page', 'commerce-kit' ) } ${ currentGridPage } ${ __( 'of', 'commerce-kit' ) } ${ totalGridPages } — ${ categories.length } ${ __( 'categories total. Additional pages are fetched from the server on the front-end.', 'commerce-kit' ) }`
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
