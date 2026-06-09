import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useState, useEffect, useRef } from '@wordpress/element';
import {
	PanelBody,
	PanelRow,
	TextControl,
	ToggleControl,
	SelectControl,
	RangeControl,
	ButtonGroup,
	Button,
	Flex,
	FlexItem,
	Spinner,
	__experimentalNumberControl as NumberControl,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// ── Small helpers ─────────────────────────────────────────────────────────────

const SubHeading = ({ children }) => (
	<div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1e1e1e', borderBottom: '1px solid #e0e0e0', paddingBottom: '6px', marginBottom: '12px', marginTop: '16px' }}>
		{children}
	</div>
);

const ColorRow = ({ label, value, onChange }) => (
	<PanelRow>
		<label style={{ fontSize: '12px', color: '#1e1e1e' }}>{label}</label>
		<input
			type="color"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			style={{ width: 36, height: 28, padding: 2, border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer' }}
		/>
	</PanelRow>
);

const SpacingRow = ({ label, topKey, rightKey, bottomKey, leftKey, attributes, setAttributes }) => (
	<div>
		<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 6 }}>{label}</div>
		<Flex>
			{[['T', topKey], ['R', rightKey], ['B', bottomKey], ['L', leftKey]].map(([abbr, key]) => (
				<FlexItem key={key}>
					<div style={{ textAlign: 'center', fontSize: '10px', color: '#888', marginBottom: 2 }}>{abbr}</div>
					<NumberControl
						value={attributes[key]}
						min={0}
						max={200}
						onChange={(v) => setAttributes({ [key]: parseInt(v) || 0 })}
						style={{ width: 56 }}
					/>
				</FlexItem>
			))}
		</Flex>
	</div>
);

const ResponsiveColumns = ({ attributes, setAttributes }) => {
	const cols = [
		['colLarge', '≥1280px', __('Large Desktop', 'commerce-kit')],
		['colDesktop', '≥1024px', __('Desktop', 'commerce-kit')],
		['colLaptop', '≥768px', __('Laptop', 'commerce-kit')],
		['colTablet', '≥480px', __('Tablet', 'commerce-kit')],
		['colMobile', '<480px', __('Mobile', 'commerce-kit')],
	];
	return (
		<div>
			<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 8 }}>{__('Columns per breakpoint', 'commerce-kit')}</div>
			<Flex wrap>
				{cols.map(([key, bp, label]) => (
					<FlexItem key={key}>
						<div style={{ textAlign: 'center', fontSize: '10px', color: '#888', marginBottom: 2 }}>{bp}</div>
						<NumberControl
							value={attributes[key]}
							min={1}
							max={10}
							onChange={(v) => setAttributes({ [key]: Math.max(1, parseInt(v) || 1) })}
							style={{ width: 52 }}
							title={label}
						/>
					</FlexItem>
				))}
			</Flex>
		</div>
	);
};

// ── Edit component ────────────────────────────────────────────────────────────

const Edit = ({ attributes, setAttributes }) => {
	const blockProps = useBlockProps({ className: 'ck-csl-editor-wrap' });
	const set = (key) => (val) => setAttributes({ [key]: val });

	const {
		// General
		layout, colDesktop, colLaptop, colTablet, colMobile, colLarge,
		spaceBetween, filterType, specificCategories, hideEmpty,
		hideCatWithoutThumb, totalCategories, orderBy, order, randomize,
		// Display – Basic
		showSectionTitle, sectionTitleText, contentPosition,
		overlayBgColor, overlayHoverBgColor, overlayContentVisibility,
		equalHeight, contentPadTop, contentPadRight, contentPadBottom, contentPadLeft,
		// Display – Category Content
		showCatName, showProductCount, productCountPos, productCountBefore, productCountAfter,
		showDescription, showCustomText, customText,
		// Display – Shop Now
		showShopNow, shopNowLabel, shopNowBgColor, shopNowHoverBg, shopNowTextColor,
		shopNowBorderRadius, shopNowAlignment, shopNowTarget, shopNowMarginTop,
		// Typography
		catNameColor, catNameFontSize, catNameFontWeight, catNameMarginTop,
		descColor, descFontSize, descMarginTop, countColor, countFontSize,
		// Thumbnail
		showThumbnail, thumbnailImgSize, thumbnailShape, thumbnailRadius,
		showThumbBorder, thumbBorderWidth, thumbBorderStyle, thumbBorderColor,
		showBoxShadow, boxShadowH, boxShadowV, boxShadowBlur, boxShadowSpread, boxShadowColor,
		thumbInnerPad, thumbMarginBottom, thumbnailZoom, imageMode,
		// Slider Controls
		autoplay, autoplaySpeed, scrollSpeed, slidesToScroll,
		pauseOnHover, infiniteLoop, adaptiveHeight, slideEffect, rtlDirection,
		// Navigation
		showNavigation, navIconStyle, navIconSize, navColor, navHoverColor,
		navBgColor, navHoverBgColor, navBorderColor, navHoverBorderColor, navBorderRadius,
		// Pagination
		showSliderPagination, sliderPaginationType, paginationColor, paginationActiveColor,
		// Misc
		touchSwipe, mousewheelControl, mouseDraggable, freeMode,
	} = attributes;

	const isOverlay = ['overlay', 'overlay_top', 'overlay_middle', 'overlay_bottom', 'overlay_box'].includes(contentPosition);

	// ── Live category fetch ─────────────────────────────────────────────────
	const [categories, setCategories]   = useState([]);
	const [isLoading, setIsLoading]     = useState(true);
	const [fetchError, setFetchError]   = useState(false);
	const abortRef                       = useRef(null);

	useEffect(() => {
		// Cancel any pending request when attributes change
		if (abortRef.current) abortRef.current = false;
		const alive = { current: true };
		abortRef.current = alive;

		setIsLoading(true);
		setFetchError(false);

		const orderByMap = { term_id: 'id', name: 'name', id: 'id', count: 'count', description: 'description' };
		const params = new URLSearchParams({
			per_page: Math.min(Math.max(1, totalCategories), 100),
			orderby:  orderByMap[orderBy] || 'name',
			order:    (order || 'ASC').toLowerCase(),
			hide_empty: hideEmpty ? 'true' : 'false',
		});

		if (filterType === 'specific' && specificCategories) {
			const ids = specificCategories.split(',').map(s => s.trim()).filter(Boolean).join(',');
			if (ids) params.set('include', ids);
		}

		window.wp.apiFetch({ path: `/wc/v3/products/categories?${params}` })
			.then(data => {
				if (!alive.current) return;
				let result = Array.isArray(data) ? data : [];
				if (hideCatWithoutThumb) {
					result = result.filter(c => c.image && c.image.src);
				}
				if (randomize) result.sort(() => Math.random() - 0.5);
				setCategories(result);
				setIsLoading(false);
			})
			.catch(() => {
				if (!alive.current) return;
				setFetchError(true);
				setIsLoading(false);
			});

		return () => { alive.current = false; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totalCategories, orderBy, order, hideEmpty, filterType, specificCategories, hideCatWithoutThumb, randomize]);

	// ── Preview helpers ─────────────────────────────────────────────────────
	const previewCount = Math.min(colDesktop || 3, 4);
	const previewCats  = categories.slice(0, previewCount);

	const thumbBr = thumbnailShape === 'circle' ? '50%'
	              : thumbnailShape === 'rounded' ? '8px'
	              : thumbnailRadius > 0 ? thumbnailRadius + 'px'
	              : '0';

	return (
		<div {...blockProps}>
			{/* ─── Inspector Controls ──────────────────────────────────────── */}
			<InspectorControls>

				{/* ═══════════════════════════════════════════════════════════ */}
				{/* GENERAL SETTINGS                                            */}
				{/* ═══════════════════════════════════════════════════════════ */}
				<PanelBody title={__('General Settings', 'commerce-kit')} initialOpen={true}>

					<div style={{ marginBottom: 12 }}>
						<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 6 }}>{__('Layout', 'commerce-kit')}</div>
						<ButtonGroup>
							{[['carousel', __('Carousel', 'commerce-kit')], ['slider', __('Slider (1-col)', 'commerce-kit')]].map(([val, label]) => (
								<Button key={val} variant={layout === val ? 'primary' : 'secondary'} onClick={() => setAttributes({ layout: val })} size="small">
									{label}
								</Button>
							))}
						</ButtonGroup>
					</div>

					{'carousel' === layout && <ResponsiveColumns attributes={attributes} setAttributes={setAttributes} />}

					<div style={{ marginTop: 12 }}>
						<RangeControl
							label={__('Space Between Categories (px)', 'commerce-kit')}
							value={spaceBetween}
							onChange={set('spaceBetween')}
							min={0} max={100}
						/>
					</div>

					<Divider />

					<SelectControl
						label={__('Filter Categories', 'commerce-kit')}
						value={filterType}
						options={[
							{ label: __('Show All', 'commerce-kit'), value: 'all' },
							{ label: __('Specific Categories', 'commerce-kit'), value: 'specific' },
						]}
						onChange={set('filterType')}
					/>

					{'specific' === filterType && (
						<TextControl
							label={__('Category IDs (comma-separated)', 'commerce-kit')}
							value={specificCategories}
							onChange={set('specificCategories')}
							help={__('e.g. 12,34,56', 'commerce-kit')}
						/>
					)}

					<NumberControl
						label={__('Total Categories to Show', 'commerce-kit')}
						value={totalCategories}
						min={1} max={200}
						onChange={(v) => setAttributes({ totalCategories: Math.max(1, parseInt(v) || 12) })}
					/>

					<SelectControl
						label={__('Order By', 'commerce-kit')}
						value={orderBy}
						options={[
							{ label: __('Name', 'commerce-kit'),       value: 'name' },
							{ label: __('ID', 'commerce-kit'),         value: 'id' },
							{ label: __('Count', 'commerce-kit'),      value: 'count' },
							{ label: __('Date Added', 'commerce-kit'), value: 'term_id' },
							{ label: __('Description', 'commerce-kit'), value: 'description' },
						]}
						onChange={set('orderBy')}
					/>

					<SelectControl
						label={__('Order', 'commerce-kit')}
						value={order}
						options={[
							{ label: __('Ascending (A→Z)', 'commerce-kit'),  value: 'ASC' },
							{ label: __('Descending (Z→A)', 'commerce-kit'), value: 'DESC' },
						]}
						onChange={set('order')}
					/>

					<ToggleControl label={__('Randomize Order', 'commerce-kit')}       checked={randomize}           onChange={set('randomize')} />
					<ToggleControl label={__('Hide Empty Categories', 'commerce-kit')} checked={hideEmpty}            onChange={set('hideEmpty')} />
					<ToggleControl label={__('Hide Categories Without Thumbnail', 'commerce-kit')} checked={hideCatWithoutThumb} onChange={set('hideCatWithoutThumb')} />

				</PanelBody>

				{/* ═══════════════════════════════════════════════════════════ */}
				{/* DISPLAY SETTINGS                                            */}
				{/* ═══════════════════════════════════════════════════════════ */}
				<PanelBody title={__('Display Settings', 'commerce-kit')} initialOpen={false}>

					{/* Basic Styles */}
					<SubHeading>{__('Basic Styles', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Show Section Title', 'commerce-kit')} checked={showSectionTitle} onChange={set('showSectionTitle')} />
					{showSectionTitle && (
						<TextControl label={__('Section Title Text', 'commerce-kit')} value={sectionTitleText} onChange={set('sectionTitleText')} />
					)}

					<SelectControl
						label={__('Category Content Position', 'commerce-kit')}
						value={contentPosition}
						options={[
							{ label: __('Below Thumbnail', 'commerce-kit'),          value: 'below' },
							{ label: __('Above Thumbnail', 'commerce-kit'),          value: 'above' },
							{ label: __('Left of Thumbnail', 'commerce-kit'),        value: 'left' },
							{ label: __('Right of Thumbnail', 'commerce-kit'),       value: 'right' },
							{ label: __('Overlay (Bottom)', 'commerce-kit'),         value: 'overlay' },
							{ label: __('Overlay (Top)', 'commerce-kit'),            value: 'overlay_top' },
							{ label: __('Overlay (Middle)', 'commerce-kit'),         value: 'overlay_middle' },
							{ label: __('Overlay (Bottom)', 'commerce-kit'),         value: 'overlay_bottom' },
							{ label: __('Overlay Box', 'commerce-kit'),              value: 'overlay_box' },
						]}
						onChange={set('contentPosition')}
					/>

					{isOverlay && (
						<>
							<ColorRow label={__('Overlay Background', 'commerce-kit')} value={overlayBgColor.startsWith('rgba') ? '#000000' : overlayBgColor} onChange={set('overlayBgColor')} />
							<ColorRow label={__('Overlay Hover Background', 'commerce-kit')} value={overlayHoverBgColor.startsWith('rgba') ? '#000000' : overlayHoverBgColor} onChange={set('overlayHoverBgColor')} />
							<SelectControl
								label={__('Overlay Content Visibility', 'commerce-kit')}
								value={overlayContentVisibility}
								options={[
									{ label: __('Always Visible', 'commerce-kit'), value: 'always' },
									{ label: __('Visible on Hover', 'commerce-kit'), value: 'on_hover' },
								]}
								onChange={set('overlayContentVisibility')}
							/>
						</>
					)}

					<ToggleControl label={__('Equal Card Height', 'commerce-kit')} checked={equalHeight} onChange={set('equalHeight')} />

					<SpacingRow
						label={__('Content Padding (px)', 'commerce-kit')}
						topKey="contentPadTop" rightKey="contentPadRight"
						bottomKey="contentPadBottom" leftKey="contentPadLeft"
						attributes={attributes} setAttributes={setAttributes}
					/>

					{/* Category Content */}
					<SubHeading>{__('Category Content', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Show Category Name', 'commerce-kit')}   checked={showCatName}       onChange={set('showCatName')} />
					<ToggleControl label={__('Show Product Count', 'commerce-kit')}   checked={showProductCount}  onChange={set('showProductCount')} />
					{showProductCount && (
						<>
							<SelectControl
								label={__('Count Position', 'commerce-kit')}
								value={productCountPos}
								options={[
									{ label: __('Beside Category Name', 'commerce-kit'), value: 'beside' },
									{ label: __('Under Category Name', 'commerce-kit'),  value: 'under' },
								]}
								onChange={set('productCountPos')}
							/>
							<Flex>
								<FlexItem>
									<TextControl label={__('Before Text', 'commerce-kit')} value={productCountBefore} onChange={set('productCountBefore')} style={{ width: 60 }} />
								</FlexItem>
								<FlexItem>
									<TextControl label={__('After Text', 'commerce-kit')} value={productCountAfter} onChange={set('productCountAfter')} style={{ width: 60 }} />
								</FlexItem>
							</Flex>
						</>
					)}

					<ToggleControl label={__('Show Description', 'commerce-kit')} checked={showDescription} onChange={set('showDescription')} />
					<ToggleControl label={__('Show Custom Text', 'commerce-kit')} checked={showCustomText}  onChange={set('showCustomText')} />
					{showCustomText && (
						<TextControl label={__('Custom Text', 'commerce-kit')} value={customText} onChange={set('customText')} />
					)}

					{/* Shop Now Button */}
					<SubHeading>{__('Shop Now Button', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Show Shop Now Button', 'commerce-kit')} checked={showShopNow} onChange={set('showShopNow')} />
					{showShopNow && (
						<>
							<TextControl label={__('Button Label', 'commerce-kit')} value={shopNowLabel} onChange={set('shopNowLabel')} />
							<ColorRow label={__('Background Color', 'commerce-kit')}       value={shopNowBgColor}   onChange={set('shopNowBgColor')} />
							<ColorRow label={__('Hover Background', 'commerce-kit')}        value={shopNowHoverBg}   onChange={set('shopNowHoverBg')} />
							<ColorRow label={__('Text Color', 'commerce-kit')}              value={shopNowTextColor} onChange={set('shopNowTextColor')} />
							<RangeControl label={__('Border Radius (px)', 'commerce-kit')}  value={shopNowBorderRadius} onChange={set('shopNowBorderRadius')} min={0} max={50} />
							<div style={{ marginBottom: 12 }}>
								<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 6 }}>{__('Alignment', 'commerce-kit')}</div>
								<ButtonGroup>
									{[['left', '←'], ['center', '↔'], ['right', '→']].map(([val, icon]) => (
										<Button key={val} variant={shopNowAlignment === val ? 'primary' : 'secondary'} onClick={() => setAttributes({ shopNowAlignment: val })} size="small">
											{icon}
										</Button>
									))}
								</ButtonGroup>
							</div>
							<SelectControl
								label={__('Link Target', 'commerce-kit')}
								value={shopNowTarget}
								options={[
									{ label: __('Same Window (_self)', 'commerce-kit'), value: '_self' },
									{ label: __('New Tab (_blank)', 'commerce-kit'),    value: '_blank' },
								]}
								onChange={set('shopNowTarget')}
							/>
							<NumberControl label={__('Top Margin (px)', 'commerce-kit')} value={shopNowMarginTop} min={0} max={60} onChange={(v) => setAttributes({ shopNowMarginTop: parseInt(v) || 0 })} />
						</>
					)}

					{/* Typography */}
					<SubHeading>{__('Typography', 'commerce-kit')}</SubHeading>

					<div style={{ fontSize: '12px', color: '#757575', marginBottom: 6 }}>{__('Category Name', 'commerce-kit')}</div>
					<Flex>
						<FlexItem><NumberControl label={__('Size (px)', 'commerce-kit')} value={catNameFontSize} min={10} max={60} onChange={(v) => setAttributes({ catNameFontSize: parseInt(v) || 16 })} /></FlexItem>
						<FlexItem><ColorRow label={__('Color', 'commerce-kit')} value={catNameColor} onChange={set('catNameColor')} /></FlexItem>
					</Flex>
					<SelectControl
						label={__('Font Weight', 'commerce-kit')}
						value={catNameFontWeight}
						options={[
							{ label: '400 – Normal', value: '400' },
							{ label: '500 – Medium', value: '500' },
							{ label: '600 – Semi Bold', value: '600' },
							{ label: '700 – Bold', value: '700' },
							{ label: '800 – Extra Bold', value: '800' },
						]}
						onChange={set('catNameFontWeight')}
					/>

					<div style={{ fontSize: '12px', color: '#757575', marginTop: 12, marginBottom: 6 }}>{__('Description', 'commerce-kit')}</div>
					<Flex>
						<FlexItem><NumberControl label={__('Size (px)', 'commerce-kit')} value={descFontSize} min={10} max={40} onChange={(v) => setAttributes({ descFontSize: parseInt(v) || 14 })} /></FlexItem>
						<FlexItem><ColorRow label={__('Color', 'commerce-kit')} value={descColor} onChange={set('descColor')} /></FlexItem>
					</Flex>

					<div style={{ fontSize: '12px', color: '#757575', marginTop: 12, marginBottom: 6 }}>{__('Product Count', 'commerce-kit')}</div>
					<Flex>
						<FlexItem><NumberControl label={__('Size (px)', 'commerce-kit')} value={countFontSize} min={10} max={40} onChange={(v) => setAttributes({ countFontSize: parseInt(v) || 13 })} /></FlexItem>
						<FlexItem><ColorRow label={__('Color', 'commerce-kit')} value={countColor} onChange={set('countColor')} /></FlexItem>
					</Flex>

				</PanelBody>

				{/* ═══════════════════════════════════════════════════════════ */}
				{/* THUMBNAIL SETTINGS                                          */}
				{/* ═══════════════════════════════════════════════════════════ */}
				<PanelBody title={__('Thumbnail Settings', 'commerce-kit')} initialOpen={false}>

					<ToggleControl label={__('Show Thumbnail', 'commerce-kit')} checked={showThumbnail} onChange={set('showThumbnail')} />

					{showThumbnail && (
						<>
							<SelectControl
								label={__('Image Size', 'commerce-kit')}
								value={thumbnailImgSize}
								options={[
									{ label: __('Thumbnail (150×150)', 'commerce-kit'),   value: 'thumbnail' },
									{ label: __('Medium (300×300)', 'commerce-kit'),       value: 'medium' },
									{ label: __('Medium Large (768px)', 'commerce-kit'),   value: 'medium_large' },
									{ label: __('Large (1024px)', 'commerce-kit'),         value: 'large' },
									{ label: __('WooCommerce Thumbnail', 'commerce-kit'),  value: 'woocommerce_thumbnail' },
									{ label: __('Full Size', 'commerce-kit'),              value: 'full' },
								]}
								onChange={set('thumbnailImgSize')}
							/>

							<SubHeading>{__('Shape', 'commerce-kit')}</SubHeading>
							<ButtonGroup>
								{[['square', __('Square', 'commerce-kit')], ['rounded', __('Rounded', 'commerce-kit')], ['circle', __('Circle', 'commerce-kit')]].map(([val, label]) => (
									<Button key={val} variant={thumbnailShape === val ? 'primary' : 'secondary'} onClick={() => setAttributes({ thumbnailShape: val })} size="small">
										{label}
									</Button>
								))}
							</ButtonGroup>
							{thumbnailShape === 'square' && (
								<div style={{ marginTop: 8 }}>
									<NumberControl label={__('Custom Border Radius (px)', 'commerce-kit')} value={thumbnailRadius} min={0} max={50} onChange={(v) => setAttributes({ thumbnailRadius: parseInt(v) || 0 })} />
								</div>
							)}

							<SubHeading>{__('Border', 'commerce-kit')}</SubHeading>
							<ToggleControl label={__('Show Thumbnail Border', 'commerce-kit')} checked={showThumbBorder} onChange={set('showThumbBorder')} />
							{showThumbBorder && (
								<Flex>
									<FlexItem><NumberControl label={__('Width (px)', 'commerce-kit')} value={thumbBorderWidth} min={1} max={10} onChange={(v) => setAttributes({ thumbBorderWidth: parseInt(v) || 1 })} /></FlexItem>
									<FlexItem>
										<SelectControl label={__('Style', 'commerce-kit')} value={thumbBorderStyle}
											options={[
												{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' },
												{ label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' },
											]}
											onChange={set('thumbBorderStyle')}
										/>
									</FlexItem>
									<FlexItem><ColorRow label={__('Color', 'commerce-kit')} value={thumbBorderColor} onChange={set('thumbBorderColor')} /></FlexItem>
								</Flex>
							)}

							<SubHeading>{__('Box Shadow', 'commerce-kit')}</SubHeading>
							<ToggleControl label={__('Enable Box Shadow', 'commerce-kit')} checked={showBoxShadow} onChange={set('showBoxShadow')} />
							{showBoxShadow && (
								<>
									<Flex>
										<FlexItem><NumberControl label="H" value={boxShadowH} min={-50} max={50} onChange={(v) => setAttributes({ boxShadowH: parseInt(v) || 0 })} /></FlexItem>
										<FlexItem><NumberControl label="V" value={boxShadowV} min={-50} max={50} onChange={(v) => setAttributes({ boxShadowV: parseInt(v) || 4 })} /></FlexItem>
										<FlexItem><NumberControl label={__('Blur', 'commerce-kit')} value={boxShadowBlur} min={0} max={80} onChange={(v) => setAttributes({ boxShadowBlur: parseInt(v) || 0 })} /></FlexItem>
										<FlexItem><NumberControl label={__('Spread', 'commerce-kit')} value={boxShadowSpread} min={-20} max={40} onChange={(v) => setAttributes({ boxShadowSpread: parseInt(v) || 0 })} /></FlexItem>
									</Flex>
									<ColorRow label={__('Shadow Color', 'commerce-kit')} value={boxShadowColor.startsWith('rgba') ? '#000000' : boxShadowColor} onChange={set('boxShadowColor')} />
								</>
							)}

							<SubHeading>{__('Effects', 'commerce-kit')}</SubHeading>
							<SelectControl
								label={__('Thumbnail Zoom', 'commerce-kit')}
								value={thumbnailZoom}
								options={[
									{ label: __('None', 'commerce-kit'),    value: 'none' },
									{ label: __('Zoom In', 'commerce-kit'), value: 'zoom_in' },
									{ label: __('Zoom Out', 'commerce-kit'),value: 'zoom_out' },
								]}
								onChange={set('thumbnailZoom')}
							/>
							<SelectControl
								label={__('Image Mode', 'commerce-kit')}
								value={imageMode}
								options={[
									{ label: __('Normal', 'commerce-kit'),    value: 'normal' },
									{ label: __('Grayscale', 'commerce-kit'), value: 'grayscale' },
								]}
								onChange={set('imageMode')}
							/>

							<NumberControl label={__('Inner Padding (px)', 'commerce-kit')} value={thumbInnerPad} min={0} max={40} onChange={(v) => setAttributes({ thumbInnerPad: parseInt(v) || 0 })} />
							<NumberControl label={__('Bottom Margin (px)', 'commerce-kit')} value={thumbMarginBottom} min={0} max={60} onChange={(v) => setAttributes({ thumbMarginBottom: parseInt(v) || 0 })} />
						</>
					)}
				</PanelBody>

				{/* ═══════════════════════════════════════════════════════════ */}
				{/* SLIDER SETTINGS                                             */}
				{/* ═══════════════════════════════════════════════════════════ */}
				<PanelBody title={__('Slider Settings', 'commerce-kit')} initialOpen={false}>

					{/* Slider Controls */}
					<SubHeading>{__('Slider Controls', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Autoplay', 'commerce-kit')} checked={autoplay} onChange={set('autoplay')} />
					{autoplay && (
						<RangeControl label={__('Autoplay Speed (ms)', 'commerce-kit')} value={autoplaySpeed} onChange={set('autoplaySpeed')} min={500} max={10000} step={100} />
					)}
					<RangeControl label={__('Scroll Speed (ms)', 'commerce-kit')} value={scrollSpeed} onChange={set('scrollSpeed')} min={100} max={3000} step={50} />
					<NumberControl label={__('Slides to Scroll', 'commerce-kit')} value={slidesToScroll} min={1} max={10} onChange={(v) => setAttributes({ slidesToScroll: Math.max(1, parseInt(v) || 1) })} />
					<ToggleControl label={__('Pause on Hover', 'commerce-kit')}  checked={pauseOnHover}    onChange={set('pauseOnHover')} />
					<ToggleControl label={__('Infinite Loop', 'commerce-kit')}   checked={infiniteLoop}    onChange={set('infiniteLoop')} />
					<ToggleControl label={__('Adaptive Height', 'commerce-kit')} checked={adaptiveHeight}  onChange={set('adaptiveHeight')} />
					<SelectControl
						label={__('Slide Effect', 'commerce-kit')}
						value={slideEffect}
						options={[
							{ label: __('Slide', 'commerce-kit'), value: 'slide' },
							{ label: __('Fade', 'commerce-kit'),  value: 'fade' },
						]}
						onChange={set('slideEffect')}
					/>
					<ToggleControl label={__('Right-to-Left Direction', 'commerce-kit')} checked={rtlDirection} onChange={set('rtlDirection')} />

					{/* Navigation */}
					<SubHeading>{__('Navigation', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Show Navigation Arrows', 'commerce-kit')} checked={showNavigation} onChange={set('showNavigation')} />
					{showNavigation && (
						<>
							<SelectControl
								label={__('Arrow Icon Style', 'commerce-kit')}
								value={String(navIconStyle)}
								options={[
									{ label: __('Style 1 – Chevron', 'commerce-kit'),     value: '1' },
									{ label: __('Style 2 – Arrow with Line', 'commerce-kit'), value: '2' },
									{ label: __('Style 3 – Arrow in Circle', 'commerce-kit'), value: '3' },
								]}
								onChange={(v) => setAttributes({ navIconStyle: parseInt(v) })}
							/>
							<RangeControl label={__('Icon Size (px)', 'commerce-kit')} value={navIconSize} onChange={set('navIconSize')} min={12} max={48} />
							<Flex wrap>
								<FlexItem><ColorRow label={__('Arrow Color', 'commerce-kit')}       value={navColor}          onChange={set('navColor')} /></FlexItem>
								<FlexItem><ColorRow label={__('Arrow Hover Color', 'commerce-kit')} value={navHoverColor}     onChange={set('navHoverColor')} /></FlexItem>
								<FlexItem><ColorRow label={__('BG Color', 'commerce-kit')}          value={navBgColor}        onChange={set('navBgColor')} /></FlexItem>
								<FlexItem><ColorRow label={__('BG Hover', 'commerce-kit')}          value={navHoverBgColor}   onChange={set('navHoverBgColor')} /></FlexItem>
								<FlexItem><ColorRow label={__('Border', 'commerce-kit')}            value={navBorderColor}    onChange={set('navBorderColor')} /></FlexItem>
								<FlexItem><ColorRow label={__('Border Hover', 'commerce-kit')}      value={navHoverBorderColor} onChange={set('navHoverBorderColor')} /></FlexItem>
							</Flex>
							<RangeControl label={__('Button Border Radius (px)', 'commerce-kit')} value={navBorderRadius} onChange={set('navBorderRadius')} min={0} max={50} />
						</>
					)}

					{/* Pagination */}
					<SubHeading>{__('Pagination', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Show Pagination', 'commerce-kit')} checked={showSliderPagination} onChange={set('showSliderPagination')} />
					{showSliderPagination && (
						<>
							<SelectControl
								label={__('Pagination Type', 'commerce-kit')}
								value={sliderPaginationType}
								options={[
									{ label: __('Bullets', 'commerce-kit'),         value: 'bullets' },
									{ label: __('Dynamic Bullets', 'commerce-kit'), value: 'dynamic' },
									{ label: __('Fraction (1/10)', 'commerce-kit'), value: 'fraction' },
									{ label: __('Progress Bar', 'commerce-kit'),    value: 'progressbar' },
								]}
								onChange={set('sliderPaginationType')}
							/>
							<Flex>
								<FlexItem><ColorRow label={__('Bullet Color', 'commerce-kit')}        value={paginationColor}       onChange={set('paginationColor')} /></FlexItem>
								<FlexItem><ColorRow label={__('Active Color', 'commerce-kit')}         value={paginationActiveColor} onChange={set('paginationActiveColor')} /></FlexItem>
							</Flex>
						</>
					)}

					{/* Miscellaneous */}
					<SubHeading>{__('Miscellaneous', 'commerce-kit')}</SubHeading>

					<ToggleControl label={__('Touch Swipe', 'commerce-kit')}        checked={touchSwipe}        onChange={set('touchSwipe')} />
					<ToggleControl label={__('Mouse Wheel Control', 'commerce-kit')} checked={mousewheelControl} onChange={set('mousewheelControl')} />
					<ToggleControl label={__('Mouse Draggable', 'commerce-kit')}    checked={mouseDraggable}    onChange={set('mouseDraggable')} />
					<ToggleControl label={__('Free Mode (no snapping)', 'commerce-kit')} checked={freeMode}     onChange={set('freeMode')} />

				</PanelBody>

			</InspectorControls>

			{/* ─── Editor canvas preview ──────────────────────────────────── */}
			<div className="ck-csl-editor-preview">
				{showSectionTitle && sectionTitleText && (
					<h3 className="ck-csl-editor-title">{sectionTitleText}</h3>
				)}
				<div className="ck-csl-editor-cards" style={{ display: 'flex', gap: spaceBetween + 'px', overflow: 'hidden' }}>
					{previewCards.map((_, i) => (
						<div key={i} className="ck-csl-editor-card" style={{ flex: `0 0 calc(${100 / previewCount}% - ${spaceBetween * (previewCount - 1) / previewCount}px)` }}>
							{showThumbnail && (
								<div className="ck-csl-editor-thumb" style={{
									borderRadius: thumbnailShape === 'circle' ? '50%' : thumbnailShape === 'rounded' ? '8px' : '0',
									background: `hsl(${i * 47 + 200}, 40%, 88%)`,
									aspectRatio: '1',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#999',
									fontSize: 13,
									marginBottom: 8,
									overflow: 'hidden',
								}}>
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
								</div>
							)}
							<div style={{ padding: `${contentPadTop}px ${contentPadRight}px ${contentPadBottom}px ${contentPadLeft}px` }}>
								{showCatName && (
									<div style={{ fontWeight: catNameFontWeight, fontSize: catNameFontSize, color: catNameColor, marginBottom: 4 }}>
										{__('Category Name', 'commerce-kit')}
										{showProductCount && ' ' + productCountBefore + '12' + productCountAfter}
									</div>
								)}
								{showDescription && <div style={{ fontSize: descFontSize, color: descColor, marginBottom: 6 }}>{__('Category description text…', 'commerce-kit')}</div>}
								{showCustomText && customText && <div style={{ fontSize: 13, color: '#666' }}>{customText}</div>}
								{showShopNow && (
									<div style={{ textAlign: shopNowAlignment, marginTop: shopNowMarginTop }}>
										<span style={{ display: 'inline-block', padding: '6px 14px', background: shopNowBgColor, color: shopNowTextColor, borderRadius: shopNowBorderRadius, fontSize: 13, fontWeight: 600 }}>
											{shopNowLabel}
										</span>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
				<div className="ck-csl-editor-hint">
					{__('Front-end preview renders actual WooCommerce categories with Swiper.js.', 'commerce-kit')}
				</div>
			</div>
		</div>
	);
};

export default Edit;