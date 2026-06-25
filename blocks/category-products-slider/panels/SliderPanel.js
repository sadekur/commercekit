import {
	PanelBody, ToggleControl, CheckboxControl, SelectControl,
	RangeControl, Flex, FlexItem,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SubHeading from '../components/SubHeading';
import ColorRow   from '../components/ColorRow';

// ── Navigation Position mini-diagram ─────────────────────────────────────────
const NAV_POS_OPTIONS = [
	{ label: __( 'Top Right',       'commerce-kit' ), value: 'top-right'       },
	{ label: __( 'Top Center',      'commerce-kit' ), value: 'top-center'      },
	{ label: __( 'Top Left',        'commerce-kit' ), value: 'top-left'        },
	{ label: __( 'Bottom Right',    'commerce-kit' ), value: 'bottom-right'    },
	{ label: __( 'Bottom Center',   'commerce-kit' ), value: 'bottom-center'   },
	{ label: __( 'Bottom Left',     'commerce-kit' ), value: 'bottom-left'     },
	{ label: __( 'Vertical Inner',  'commerce-kit' ), value: 'vertical-inner'  },
	{ label: __( 'Vertical Outer',  'commerce-kit' ), value: 'vertical-outer'  },
	{ label: __( 'Vertical Center', 'commerce-kit' ), value: 'vertical-center' },
];

const Arr = ({ dir }) => (
	<span style={{
		display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
		width: 14, height: 14, background: '#444', color: '#fff',
		borderRadius: 2, fontSize: 9, fontWeight: 700, lineHeight: 1, flexShrink: 0,
	}}>{ dir === 'prev' ? '‹' : '›' }</span>
);

const Slides = () => (
	<div style={{ display: 'flex', gap: 2, flex: 1 }}>
		{ [ 0, 1, 2 ].map( i => (
			<div key={ i } style={{ flex: 1, height: 32, background: '#c0c0c0', borderRadius: 2 }} />
		) ) }
	</div>
);

const NavPosDiagram = ({ position }) => {
	const isVertical = position.startsWith( 'vertical' );
	const isBottom   = position.startsWith( 'bottom' );
	const align      = position.endsWith( 'right'  ) ? 'flex-end'
	                 : position.endsWith( 'center' ) ? 'center'
	                 : 'flex-start';

	if ( isVertical ) {
		const inset = position === 'vertical-outer' ? -16
		            : position === 'vertical-inner'  ? 4
		            : 0;
		return (
			<div style={{ border: '1px solid #ddd', borderRadius: 4, padding: '8px', margin: '8px 0 4px', position: 'relative', overflow: position === 'vertical-outer' ? 'visible' : 'hidden' }}>
				<Slides />
				<div style={{
					position: 'absolute', top: '50%', transform: 'translateY(-50%)',
					left: inset, right: inset, display: 'flex', justifyContent: 'space-between',
				}}>
					<Arr dir="prev" /><Arr dir="next" />
				</div>
			</div>
		);
	}

	const NavRow = () => (
		<div style={{ display: 'flex', justifyContent: align, gap: 4 }}>
			<Arr dir="prev" /><Arr dir="next" />
		</div>
	);

	return (
		<div style={{ border: '1px solid #ddd', borderRadius: 4, padding: '8px', margin: '8px 0 4px' }}>
			{ ! isBottom && <><NavRow /><div style={{ height: 3 }} /></> }
			<Slides />
			{ isBottom && <><div style={{ height: 3 }} /><NavRow /></> }
		</div>
	);
};

const SliderPanel = ({ attributes, setAttributes }) => {
	const {
		// Slider controls
		autoplay, autoplaySpeed, scrollSpeed, slidesToScroll,
		pauseOnHover, infiniteLoop, adaptiveHeight, rtlDirection,
		// Navigation
		showNavigation, navHideOnMobile, navPosition, navIconStyle, navIconSize,
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
			<ToggleControl label={__('Reverse Slide Direction (Right → Left)', 'commerce-kit')} checked={rtlDirection} onChange={set('rtlDirection')} />

			{/* ── Navigation */}
			<SubHeading>{__('Navigation', 'commerce-kit')}</SubHeading>

			<ToggleControl
				label={__('Show Navigation Arrows', 'commerce-kit')}
				checked={showNavigation}
				onChange={set('showNavigation')}
			/>

			<SelectControl
				label={__('Navigation Position', 'commerce-kit')}
				value={navPosition || 'top-right'}
				options={NAV_POS_OPTIONS}
				onChange={set('navPosition')}
			/>
			<NavPosDiagram position={navPosition || 'top-right'} />

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

					<div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 4px' }}>{__('Normal', 'commerce-kit')}</div>
					<ColorRow label={__('Arrow Color', 'commerce-kit')}      value={navColor}       onChange={set('navColor')} />
					<ColorRow label={__('Background', 'commerce-kit')}        value={navBgColor}     onChange={set('navBgColor')} />
					<ColorRow label={__('Border Color', 'commerce-kit')}      value={navBorderColor} onChange={set('navBorderColor')} />

					<div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 4px' }}>{__('Hover', 'commerce-kit')}</div>
					<ColorRow label={__('Arrow Color', 'commerce-kit')}      value={navHoverColor}       onChange={set('navHoverColor')} />
					<ColorRow label={__('Background', 'commerce-kit')}        value={navHoverBgColor}     onChange={set('navHoverBgColor')} />
					<ColorRow label={__('Border Color', 'commerce-kit')}      value={navHoverBorderColor} onChange={set('navHoverBorderColor')} />

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
