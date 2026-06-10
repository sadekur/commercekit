import {
	PanelBody, ToggleControl, SelectControl,
	RangeControl, Flex, FlexItem, ButtonGroup, Button,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SubHeading from '../components/SubHeading';
import ColorRow   from '../components/ColorRow';

const ThumbnailPanel = ({ attributes, setAttributes }) => {
	const {
		showThumbnail, thumbnailImgSize, thumbnailShape, thumbnailRadius,
		showThumbBorder, thumbBorderWidth, thumbBorderStyle, thumbBorderColor,
		showBoxShadow, boxShadowH, boxShadowV, boxShadowBlur, boxShadowSpread, boxShadowColor,
		thumbInnerPad, thumbMarginBottom, thumbnailZoom, imageMode,
	} = attributes;
	const set = (key) => (val) => setAttributes({ [key]: val });

	return (
		<PanelBody title={__('Thumbnail Settings', 'commerce-kit')} initialOpen={false}>

			<ToggleControl label={__('Show Thumbnail', 'commerce-kit')} checked={showThumbnail} onChange={set('showThumbnail')} />

			{showThumbnail && (
				<>
					<SelectControl
						label={__('Image Size', 'commerce-kit')}
						value={thumbnailImgSize}
						options={[
							{ label: __('Thumbnail (150×150)', 'commerce-kit'),  value: 'thumbnail' },
							{ label: __('Medium (300×300)', 'commerce-kit'),      value: 'medium' },
							{ label: __('Medium Large (768px)', 'commerce-kit'),  value: 'medium_large' },
							{ label: __('Large (1024px)', 'commerce-kit'),        value: 'large' },
							{ label: __('WooCommerce Thumbnail', 'commerce-kit'), value: 'woocommerce_thumbnail' },
							{ label: __('Full Size', 'commerce-kit'),             value: 'full' },
						]}
						onChange={set('thumbnailImgSize')}
					/>

					{/* ── Shape ─────────────────────────────────────────────── */}
					<SubHeading>{__('Shape', 'commerce-kit')}</SubHeading>
					<ButtonGroup>
						{[
							['square',  __('Square', 'commerce-kit')],
							['rounded', __('Rounded', 'commerce-kit')],
							['circle',  __('Circle', 'commerce-kit')],
						].map(([val, label]) => (
							<Button
								key={val}
								variant={thumbnailShape === val ? 'primary' : 'secondary'}
								onClick={() => setAttributes({ thumbnailShape: val })}
								size="small"
							>
								{label}
							</Button>
						))}
					</ButtonGroup>
					{thumbnailShape === 'square' && (
						<div style={{ marginTop: 8 }}>
							<NumberControl
								label={__('Custom Border Radius (px)', 'commerce-kit')}
								value={thumbnailRadius}
								min={0} max={50}
								onChange={(v) => setAttributes({ thumbnailRadius: parseInt(v) || 0 })}
							/>
						</div>
					)}

					{/* ── Border ────────────────────────────────────────────── */}
					<SubHeading>{__('Border', 'commerce-kit')}</SubHeading>
					<ToggleControl label={__('Show Thumbnail Border', 'commerce-kit')} checked={showThumbBorder} onChange={set('showThumbBorder')} />
					{showThumbBorder && (
						<Flex>
							<FlexItem>
								<NumberControl label={__('Width (px)', 'commerce-kit')} value={thumbBorderWidth} min={1} max={10} onChange={(v) => setAttributes({ thumbBorderWidth: parseInt(v) || 1 })} />
							</FlexItem>
							<FlexItem>
								<SelectControl
									label={__('Style', 'commerce-kit')}
									value={thumbBorderStyle}
									options={[
										{ label: 'Solid',  value: 'solid' },
										{ label: 'Dashed', value: 'dashed' },
										{ label: 'Dotted', value: 'dotted' },
										{ label: 'Double', value: 'double' },
									]}
									onChange={set('thumbBorderStyle')}
								/>
							</FlexItem>
							<FlexItem>
								<ColorRow label={__('Color', 'commerce-kit')} value={thumbBorderColor} onChange={set('thumbBorderColor')} />
							</FlexItem>
						</Flex>
					)}

					{/* ── Box Shadow ────────────────────────────────────────── */}
					<SubHeading>{__('Box Shadow', 'commerce-kit')}</SubHeading>
					<ToggleControl label={__('Enable Box Shadow', 'commerce-kit')} checked={showBoxShadow} onChange={set('showBoxShadow')} />
					{showBoxShadow && (
						<>
							<Flex>
								<FlexItem><NumberControl label="H"                              value={boxShadowH}      min={-50} max={50}  onChange={(v) => setAttributes({ boxShadowH:      parseInt(v) || 0 })} /></FlexItem>
								<FlexItem><NumberControl label="V"                              value={boxShadowV}      min={-50} max={50}  onChange={(v) => setAttributes({ boxShadowV:      parseInt(v) || 4 })} /></FlexItem>
								<FlexItem><NumberControl label={__('Blur', 'commerce-kit')}   value={boxShadowBlur}   min={0}   max={80}  onChange={(v) => setAttributes({ boxShadowBlur:   parseInt(v) || 0 })} /></FlexItem>
								<FlexItem><NumberControl label={__('Spread', 'commerce-kit')} value={boxShadowSpread} min={-20} max={40}  onChange={(v) => setAttributes({ boxShadowSpread: parseInt(v) || 0 })} /></FlexItem>
							</Flex>
							<ColorRow
								label={__('Shadow Color', 'commerce-kit')}
								value={boxShadowColor.startsWith('rgba') ? '#000000' : boxShadowColor}
								onChange={set('boxShadowColor')}
							/>
						</>
					)}

					{/* ── Effects ───────────────────────────────────────────── */}
					<SubHeading>{__('Effects', 'commerce-kit')}</SubHeading>
					<SelectControl
						label={__('Thumbnail Zoom', 'commerce-kit')}
						value={thumbnailZoom}
						options={[
							{ label: __('None', 'commerce-kit'),     value: 'none' },
							{ label: __('Zoom In', 'commerce-kit'),  value: 'zoom_in' },
							{ label: __('Zoom Out', 'commerce-kit'), value: 'zoom_out' },
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
					<NumberControl label={__('Inner Padding (px)', 'commerce-kit')} value={thumbInnerPad}     min={0} max={40} onChange={(v) => setAttributes({ thumbInnerPad:     parseInt(v) || 0 })} />
					<NumberControl label={__('Bottom Margin (px)', 'commerce-kit')} value={thumbMarginBottom} min={0} max={60} onChange={(v) => setAttributes({ thumbMarginBottom: parseInt(v) || 0 })} />
				</>
			)}
		</PanelBody>
	);
};

export default ThumbnailPanel;
