import {
	PanelBody, ToggleControl, SelectControl,
	RangeControl, Flex, FlexItem,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SubHeading from '../components/SubHeading';
import ColorRow   from '../components/ColorRow';

const SliderPanel = ({ attributes, setAttributes }) => {
	const {
		// Slider controls
		autoplay, autoplaySpeed, scrollSpeed, slidesToScroll,
		pauseOnHover, infiniteLoop, adaptiveHeight, slideEffect, rtlDirection,
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

			{/* ── Navigation*/}
			<SubHeading>{__('Navigation', 'commerce-kit')}</SubHeading>

			<ToggleControl label={__('Show Navigation Arrows', 'commerce-kit')} checked={showNavigation} onChange={set('showNavigation')} />
			{showNavigation && (
				<>
					<SelectControl
						label={__('Arrow Icon Style', 'commerce-kit')}
						value={String(navIconStyle)}
						options={[
							{ label: __('Style 1 – Chevron', 'commerce-kit'),           value: '1' },
							{ label: __('Style 2 – Arrow with Line', 'commerce-kit'),   value: '2' },
							{ label: __('Style 3 – Arrow in Circle', 'commerce-kit'),   value: '3' },
						]}
						onChange={(v) => setAttributes({ navIconStyle: parseInt(v) })}
					/>
					<RangeControl label={__('Icon Size (px)', 'commerce-kit')} value={navIconSize} onChange={set('navIconSize')} min={12} max={48} />
					<Flex wrap>
						<FlexItem><ColorRow label={__('Arrow Color', 'commerce-kit')}        value={navColor}            onChange={set('navColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('Arrow Hover Color', 'commerce-kit')}  value={navHoverColor}       onChange={set('navHoverColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('BG Color', 'commerce-kit')}           value={navBgColor}          onChange={set('navBgColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('BG Hover', 'commerce-kit')}           value={navHoverBgColor}     onChange={set('navHoverBgColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('Border', 'commerce-kit')}             value={navBorderColor}      onChange={set('navBorderColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('Border Hover', 'commerce-kit')}       value={navHoverBorderColor} onChange={set('navHoverBorderColor')} /></FlexItem>
					</Flex>
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
							{ label: __('Bullets', 'commerce-kit'),          value: 'bullets' },
							{ label: __('Dynamic Bullets', 'commerce-kit'),  value: 'dynamic' },
							{ label: __('Fraction (1/10)', 'commerce-kit'),  value: 'fraction' },
							{ label: __('Progress Bar', 'commerce-kit'),     value: 'progressbar' },
						]}
						onChange={set('sliderPaginationType')}
					/>
					<Flex>
						<FlexItem><ColorRow label={__('Bullet Color', 'commerce-kit')}  value={paginationColor}       onChange={set('paginationColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('Active Color', 'commerce-kit')}  value={paginationActiveColor} onChange={set('paginationActiveColor')} /></FlexItem>
					</Flex>
				</>
			)}

			{/* ── Miscellaneous */}
			<SubHeading>{__('Miscellaneous', 'commerce-kit')}</SubHeading>

			<ToggleControl label={__('Touch Swipe', 'commerce-kit')}             checked={touchSwipe}        onChange={set('touchSwipe')} />
			<ToggleControl label={__('Mouse Wheel Control', 'commerce-kit')}     checked={mousewheelControl} onChange={set('mousewheelControl')} />
			<ToggleControl label={__('Mouse Draggable', 'commerce-kit')}         checked={mouseDraggable}    onChange={set('mouseDraggable')} />
			<ToggleControl label={__('Free Mode (no snapping)', 'commerce-kit')} checked={freeMode}          onChange={set('freeMode')} />

		</PanelBody>
	);
};

export default SliderPanel;
