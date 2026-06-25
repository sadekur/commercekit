import {
	PanelBody, ToggleControl, SelectControl,
	RangeControl, Flex, FlexItem,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SubHeading      from '../components/SubHeading';
import ColorRow        from '../components/ColorRow';
import NormalHoverTabs from '../components/NormalHoverTabs';

// ── Navigation icon picker ────────────────────────────────────────────────────
const NavIconPreview = ({ style }) => {
	const paths = () => {
		switch ( style ) {
			case 1: return <polyline points="9 18 15 12 9 6"/>;
			case 2: return <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>;
			case 3: return <><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></>;
			case 4: return <polyline points="7 4 17 12 7 20"/>;
			case 5: return <><polyline points="6 5 13 12 6 19"/><polyline points="12 5 19 12 12 19"/></>;
			case 6: return <><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="10 8 16 12 10 16"/></>;
			default: return <polyline points="9 18 15 12 9 6"/>;
		}
	};
	return (
		<svg width={15} height={15} viewBox="0 0 24 24" fill="none"
			stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			{ paths() }
		</svg>
	);
};

// ── Pagination style visual preview ──────────────────────────────────────────
const PAGER_TYPES = [
	{ value: 'bullets',     label: 'Bullets' },
	{ value: 'dynamic',     label: 'Dynamic' },
	{ value: 'fraction',    label: 'Fraction' },
	{ value: 'progressbar', label: 'Progress' },
];

const PagerStylePreview = ({ type, active }) => {
	const fg  = active ? '#fff' : '#555';
	const dim = active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)';

	if ( type === 'bullets' ) return (
		<div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
			{ [ 0, 1, 2, 3, 4 ].map( ( i ) => (
				<div key={ i } style={{ width: 6, height: 6, borderRadius: '50%', background: i === 2 ? fg : dim }} />
			) ) }
		</div>
	);

	if ( type === 'dynamic' ) return (
		<div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
			{ [ [ 4, false ], [ 5, false ], [ 9, true ], [ 5, false ], [ 4, false ] ].map( ( [ s, a ], i ) => (
				<div key={ i } style={{ width: s, height: s, borderRadius: '50%', background: a ? fg : dim }} />
			) ) }
		</div>
	);

	if ( type === 'fraction' ) return (
		<span style={{ fontSize: 11, fontWeight: 700, color: fg, letterSpacing: '-0.02em' }}>1/5</span>
	);

	return (
		<div style={{ width: 42, height: 3, background: dim, borderRadius: 2, overflow: 'hidden' }}>
			<div style={{ width: '40%', height: '100%', background: fg, borderRadius: 2 }} />
		</div>
	);
};

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
		showSliderPagination, paginationHideOnMobile, sliderPaginationType,
		paginationColor, paginationActiveColor,
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
					<ToggleControl
						label={__('Hide on Mobile', 'commerce-kit')}
						checked={navHideOnMobile}
						onChange={set('navHideOnMobile')}
					/>

					<div style={{ marginBottom: 8 }}>
						<p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#757575', margin: '0 0 6px' }}>
							{ __( 'Arrow Icon Style', 'commerce-kit' ) }
						</p>
						<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
							{ [ 1, 2, 3, 4, 5, 6 ].map( ( i ) => {
								const active = navIconStyle === i;
								return (
									<button
										key={ i }
										type="button"
										title={ `Style ${ i }` }
										onClick={ () => setAttributes( { navIconStyle: i } ) }
										style={{
											width: 34, height: 34,
											display: 'flex', alignItems: 'center', justifyContent: 'center',
											border:       active ? '2px solid #0073aa' : '1px solid #ddd',
											borderRadius: 5,
											background:   active ? '#0073aa' : '#f9f9f9',
											color:        active ? '#fff' : '#444',
											cursor: 'pointer', padding: 0,
											transition: 'all 0.15s',
										}}
									>
										<NavIconPreview style={ i } />
									</button>
								);
							} ) }
						</div>
					</div>
					<RangeControl label={__('Icon Size (px)', 'commerce-kit')} value={navIconSize} onChange={set('navIconSize')} min={12} max={48} />

					<NormalHoverTabs
						normal={<>
							<ColorRow label={__('Arrow Color', 'commerce-kit')}  value={navColor}       onChange={set('navColor')} />
							<ColorRow label={__('Background', 'commerce-kit')}   value={navBgColor}     onChange={set('navBgColor')} />
							<ColorRow label={__('Border Color', 'commerce-kit')} value={navBorderColor} onChange={set('navBorderColor')} />
						</>}
						hover={<>
							<ColorRow label={__('Arrow Color', 'commerce-kit')}  value={navHoverColor}       onChange={set('navHoverColor')} />
							<ColorRow label={__('Background', 'commerce-kit')}   value={navHoverBgColor}     onChange={set('navHoverBgColor')} />
							<ColorRow label={__('Border Color', 'commerce-kit')} value={navHoverBorderColor} onChange={set('navHoverBorderColor')} />
						</>}
					/>

					<RangeControl label={__('Button Border Radius (px)', 'commerce-kit')} value={navBorderRadius} onChange={set('navBorderRadius')} min={0} max={50} />
				</>
			)}

			{/* ── Pagination */}
			<SubHeading>{__('Pagination', 'commerce-kit')}</SubHeading>

			<ToggleControl
				label={__('Show Pagination', 'commerce-kit')}
				checked={showSliderPagination}
				onChange={set('showSliderPagination')}
			/>
			{showSliderPagination && (
				<>
					<ToggleControl
						label={__('Hide on Mobile', 'commerce-kit')}
						checked={paginationHideOnMobile}
						onChange={set('paginationHideOnMobile')}
					/>

					<div style={{ marginBottom: 8 }}>
						<p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#757575', margin: '0 0 6px' }}>
							{ __( 'Pagination Style', 'commerce-kit' ) }
						</p>
						<div style={{ display: 'flex', gap: 4 }}>
							{ PAGER_TYPES.map( ( { value, label } ) => {
								const active = sliderPaginationType === value;
								return (
									<button
										key={ value }
										type="button"
										title={ label }
										onClick={ () => setAttributes( { sliderPaginationType: value } ) }
										style={{
											flex: '1 1 0',
											height: 34,
											display: 'flex', alignItems: 'center', justifyContent: 'center',
											border:       active ? '2px solid #0073aa' : '1px solid #ddd',
											borderRadius: 5,
											background:   active ? '#0073aa' : '#f9f9f9',
											color:        active ? '#fff' : '#444',
											cursor: 'pointer', padding: '0 6px',
											transition: 'all 0.15s',
										}}
									>
										<PagerStylePreview type={ value } active={ active } />
									</button>
								);
							} ) }
						</div>
					</div>

					<Flex>
						<FlexItem><ColorRow label={__('Bullet Color', 'commerce-kit')}  value={paginationColor}       onChange={set('paginationColor')} /></FlexItem>
						<FlexItem><ColorRow label={__('Active Color', 'commerce-kit')}  value={paginationActiveColor} onChange={set('paginationActiveColor')} /></FlexItem>
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
