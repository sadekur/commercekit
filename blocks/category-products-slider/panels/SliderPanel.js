import {
	PanelBody, ToggleControl, SelectControl,
	RangeControl, Flex, FlexItem,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SubHeading from '../components/SubHeading';
import ColorRow   from '../components/ColorRow';

const SWATCH = { width: 32, height: 28, padding: 2, border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', display: 'block' };
const COL_HEAD = { fontSize: 10, fontWeight: 600, color: '#888', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 };
const ROW_LABEL = { fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', height: 28 };

const SliderPanel = ({ attributes, setAttributes }) => {
	const {
		// Slider controls
		autoplay, autoplaySpeed, scrollSpeed, slidesToScroll,
		pauseOnHover, infiniteLoop, adaptiveHeight, rtlDirection,
		// Navigation
		showNavigation, navIconStyle, navIconSize,
		navColor, navHoverColor, navBgColor, navHoverBgColor,
		navBorderColor, navHoverBorderColor, navBorderRadius,
		// Pagination
		showSliderPagination, sliderPaginationType, paginationColor, paginationActiveColor,
		// Misc
		touchSwipe, mousewheelControl, mouseDraggable, freeMode,
	} = attributes;
	const set = (key) => (val) => setAttributes({ [key]: val });
	const swatch = (key) => (e) => setAttributes({ [key]: e.target.value });

	return (
		<PanelBody title={__('Slider Settings', 'commerce-kit')} initialOpen={false}>

			{/* ── Slider Controls */}
			<SubHeading>{__('Slider Controls', 'commerce-kit')}</SubHeading>

			<ToggleControl label={__('Autoplay', 'commerce-kit')} checked={autoplay} onChange={set('autoplay')} />
			{autoplay && (
				<RangeControl label={__('Autoplay Speed (ms)', 'commerce-kit')} value={autoplaySpeed} onChange={set('autoplaySpeed')} min={500} max={10000} step={100} />
			)}
			<RangeControl label={__('Scroll Speed (ms)', 'commerce-kit')} value={scrollSpeed} onChange={set('scrollSpeed')} min={100} max={3000} step={50} />
			<NumberControl
				label={__('Slides to Scroll', 'commerce-kit')}
				value={slidesToScroll}
				min={1} max={10}
				onChange={(v) => setAttributes({ slidesToScroll: Math.max(1, parseInt(v) || 1) })}
			/>
			<ToggleControl label={__('Pause on Hover', 'commerce-kit')}  checked={pauseOnHover}   onChange={set('pauseOnHover')} />
			<ToggleControl label={__('Infinite Loop', 'commerce-kit')}   checked={infiniteLoop}   onChange={set('infiniteLoop')} />
			<ToggleControl label={__('Adaptive Height', 'commerce-kit')} checked={adaptiveHeight} onChange={set('adaptiveHeight')} />
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

			{/* ── Navigation */}
			<SubHeading>{__('Navigation', 'commerce-kit')}</SubHeading>

			<ToggleControl label={__('Show Navigation Arrows', 'commerce-kit')} checked={showNavigation} onChange={set('showNavigation')} />

			{showNavigation && (
				<>
					<SelectControl
						label={__('Arrow Icon Style', 'commerce-kit')}
						value={String(navIconStyle)}
						options={[
							{ label: __('Style 1 – Chevron', 'commerce-kit'),         value: '1' },
							{ label: __('Style 2 – Arrow with Line', 'commerce-kit'), value: '2' },
							{ label: __('Style 3 – Arrow in Circle', 'commerce-kit'), value: '3' },
						]}
						onChange={(v) => setAttributes({ navIconStyle: parseInt(v) })}
					/>
					<RangeControl label={__('Icon Size (px)', 'commerce-kit')} value={navIconSize} onChange={set('navIconSize')} min={12} max={48} />

					{/* Normal / Hover color grid */}
					<div style={{ background: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: 4, padding: '10px 12px', marginBottom: 10 }}>
						<div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr', gap: '8px 6px', alignItems: 'center' }}>
							{/* Column headers */}
							<div />
							<div style={COL_HEAD}>{__('Normal', 'commerce-kit')}</div>
							<div style={COL_HEAD}>{__('Hover', 'commerce-kit')}</div>
							{/* Arrow */}
							<div style={ROW_LABEL}>{__('Arrow', 'commerce-kit')}</div>
							<div style={{ display: 'flex', justifyContent: 'center' }}><input type="color" value={navColor}       onChange={swatch('navColor')}       style={SWATCH} /></div>
							<div style={{ display: 'flex', justifyContent: 'center' }}><input type="color" value={navHoverColor}  onChange={swatch('navHoverColor')}  style={SWATCH} /></div>
							{/* Background */}
							<div style={ROW_LABEL}>{__('BG', 'commerce-kit')}</div>
							<div style={{ display: 'flex', justifyContent: 'center' }}><input type="color" value={navBgColor}     onChange={swatch('navBgColor')}     style={SWATCH} /></div>
							<div style={{ display: 'flex', justifyContent: 'center' }}><input type="color" value={navHoverBgColor} onChange={swatch('navHoverBgColor')} style={SWATCH} /></div>
							{/* Border */}
							<div style={ROW_LABEL}>{__('Border', 'commerce-kit')}</div>
							<div style={{ display: 'flex', justifyContent: 'center' }}><input type="color" value={navBorderColor}      onChange={swatch('navBorderColor')}      style={SWATCH} /></div>
							<div style={{ display: 'flex', justifyContent: 'center' }}><input type="color" value={navHoverBorderColor} onChange={swatch('navHoverBorderColor')} style={SWATCH} /></div>
						</div>
					</div>

					<RangeControl label={__('Button Border Radius (px)', 'commerce-kit')} value={navBorderRadius} onChange={set('navBorderRadius')} min={0} max={50} />
				</>
			)}

			{/* ── Pagination */}
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
						<FlexItem><ColorRow label={__('Bullet Color', 'commerce-kit')} value={paginationColor}       onChange={set('paginationColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('Active Color', 'commerce-kit')} value={paginationActiveColor} onChange={set('paginationActiveColor')} /></FlexItem>
					</Flex>
				</>
			)}

			{/* ── Miscellaneous */}
			<SubHeading>{__('Miscellaneous', 'commerce-kit')}</SubHeading>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px' }}>
				<ToggleControl label={__('Touch Swipe', 'commerce-kit')}        checked={touchSwipe}        onChange={set('touchSwipe')} />
				<ToggleControl label={__('Mouse Wheel', 'commerce-kit')}        checked={mousewheelControl} onChange={set('mousewheelControl')} />
				<ToggleControl label={__('Mouse Drag', 'commerce-kit')}         checked={mouseDraggable}    onChange={set('mouseDraggable')} />
				<ToggleControl label={__('Free Mode', 'commerce-kit')}          checked={freeMode}          onChange={set('freeMode')} />
			</div>

		</PanelBody>
	);
};

export default SliderPanel;
