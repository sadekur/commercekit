import {
	PanelBody, TextControl, ToggleControl, SelectControl,
	RangeControl, ButtonGroup, Button, Flex, FlexItem,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SubHeading from '../components/SubHeading';
import ColorRow   from '../components/ColorRow';
import SpacingRow from '../components/SpacingRow';

const DisplayPanel = ({ attributes, setAttributes }) => {
	const {
		// Basic
		showSectionTitle, sectionTitleText, contentPosition,
		overlayBgColor, overlayHoverBgColor, overlayContentVisibility,
		equalHeight, contentPadTop, contentPadRight, contentPadBottom, contentPadLeft,
		// Category content
		showCatName, showProductCount, productCountPos, productCountBefore, productCountAfter,
		showDescription, showCustomText, customText,
		// Shop now
		showShopNow, shopNowLabel, shopNowBgColor, shopNowHoverBg, shopNowTextColor,
		shopNowBorderRadius, shopNowAlignment, shopNowTarget, shopNowMarginTop,
		// Typography
		catNameColor, catNameFontSize, catNameFontWeight,
		descColor, descFontSize, countColor, countFontSize,
	} = attributes;
	const set = (key) => (val) => setAttributes({ [key]: val });

	const isOverlay = ['overlay', 'overlay_top', 'overlay_middle', 'overlay_bottom', 'overlay_box']
		.includes(contentPosition);

	return (
		<PanelBody title={__('Display Settings', 'commerce-kit')} initialOpen={false}>

			{/* ── Basic Styles ──*/}
			<SubHeading>{__('Basic Styles', 'commerce-kit')}</SubHeading>

			<ToggleControl
				label={__('Show Section Title', 'commerce-kit')}
				checked={showSectionTitle}
				onChange={set('showSectionTitle')}
			/>
			{showSectionTitle && (
				<TextControl
					label={__('Section Title Text', 'commerce-kit')}
					value={sectionTitleText}
					onChange={set('sectionTitleText')}
				/>
			)}

			<SelectControl
				label={__('Category Content Position', 'commerce-kit')}
				value={contentPosition}
				options={[
					{ label: __('Below Thumbnail', 'commerce-kit'),    value: 'below' },
					{ label: __('Above Thumbnail', 'commerce-kit'),    value: 'above' },
					{ label: __('Left of Thumbnail', 'commerce-kit'),  value: 'left' },
					{ label: __('Right of Thumbnail', 'commerce-kit'), value: 'right' },
					{ label: __('Overlay (Bottom)', 'commerce-kit'),   value: 'overlay' },
					{ label: __('Overlay (Top)', 'commerce-kit'),      value: 'overlay_top' },
					{ label: __('Overlay (Middle)', 'commerce-kit'),   value: 'overlay_middle' },
					{ label: __('Overlay (Bottom)', 'commerce-kit'),   value: 'overlay_bottom' },
					{ label: __('Overlay Box', 'commerce-kit'),        value: 'overlay_box' },
				]}
				onChange={set('contentPosition')}
			/>

			{isOverlay && (
				<>
					<ColorRow
						label={__('Overlay Background', 'commerce-kit')}
						value={overlayBgColor.startsWith('rgba') ? '#000000' : overlayBgColor}
						onChange={set('overlayBgColor')}
					/>
					<ColorRow
						label={__('Overlay Hover Background', 'commerce-kit')}
						value={overlayHoverBgColor.startsWith('rgba') ? '#000000' : overlayHoverBgColor}
						onChange={set('overlayHoverBgColor')}
					/>
					<SelectControl
						label={__('Overlay Content Visibility', 'commerce-kit')}
						value={overlayContentVisibility}
						options={[
							{ label: __('Always Visible', 'commerce-kit'),   value: 'always' },
							{ label: __('Visible on Hover', 'commerce-kit'), value: 'on_hover' },
						]}
						onChange={set('overlayContentVisibility')}
					/>
				</>
			)}

			<ToggleControl
				label={__('Equal Card Height', 'commerce-kit')}
				checked={equalHeight}
				onChange={set('equalHeight')}
			/>

			<SpacingRow
				label={__('Content Padding (px)', 'commerce-kit')}
				topKey="contentPadTop" rightKey="contentPadRight"
				bottomKey="contentPadBottom" leftKey="contentPadLeft"
				attributes={attributes} setAttributes={setAttributes}
			/>

			{/* ── Category Content */}
			<SubHeading>{__('Category Content', 'commerce-kit')}</SubHeading>

			<ToggleControl label={__('Show Category Name', 'commerce-kit')}  checked={showCatName}      onChange={set('showCatName')} />
			<ToggleControl label={__('Show Product Count', 'commerce-kit')}  checked={showProductCount} onChange={set('showProductCount')} />

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
							<TextControl label={__('After Text', 'commerce-kit')}  value={productCountAfter}  onChange={set('productCountAfter')}  style={{ width: 60 }} />
						</FlexItem>
					</Flex>
				</>
			)}

			<ToggleControl label={__('Show Description', 'commerce-kit')} checked={showDescription} onChange={set('showDescription')} />
			<ToggleControl label={__('Show Custom Text', 'commerce-kit')} checked={showCustomText}  onChange={set('showCustomText')} />
			{showCustomText && (
				<TextControl label={__('Custom Text', 'commerce-kit')} value={customText} onChange={set('customText')} />
			)}

			{/* ── Shop Now Button */}
			<SubHeading>{__('Shop Now Button', 'commerce-kit')}</SubHeading>

			<ToggleControl label={__('Show Shop Now Button', 'commerce-kit')} checked={showShopNow} onChange={set('showShopNow')} />

			{showShopNow && (
				<>
					<TextControl label={__('Button Label', 'commerce-kit')} value={shopNowLabel} onChange={set('shopNowLabel')} />
					<ColorRow label={__('Background Color', 'commerce-kit')} value={shopNowBgColor}   onChange={set('shopNowBgColor')} />
					<ColorRow label={__('Hover Background', 'commerce-kit')}  value={shopNowHoverBg}   onChange={set('shopNowHoverBg')} />
					<ColorRow label={__('Text Color', 'commerce-kit')}         value={shopNowTextColor} onChange={set('shopNowTextColor')} />
					<RangeControl
						label={__('Border Radius (px)', 'commerce-kit')}
						value={shopNowBorderRadius}
						onChange={set('shopNowBorderRadius')}
						min={0} max={50}
					/>
					<div style={{ marginBottom: 12 }}>
						<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 6 }}>{__('Alignment', 'commerce-kit')}</div>
						<ButtonGroup>
							{[['left', '←'], ['center', '↔'], ['right', '→']].map(([val, icon]) => (
								<Button
									key={val}
									variant={shopNowAlignment === val ? 'primary' : 'secondary'}
									onClick={() => setAttributes({ shopNowAlignment: val })}
									size="small"
								>
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
					<NumberControl
						label={__('Top Margin (px)', 'commerce-kit')}
						value={shopNowMarginTop}
						min={0} max={60}
						onChange={(v) => setAttributes({ shopNowMarginTop: parseInt(v) || 0 })}
					/>
				</>
			)}

			{/* ── Typography */}
			<SubHeading>{__('Typography', 'commerce-kit')}</SubHeading>

			<div style={{ fontSize: '12px', color: '#757575', marginBottom: 6 }}>{__('Category Name', 'commerce-kit')}</div>
			<Flex>
				<FlexItem>
					<NumberControl label={__('Size (px)', 'commerce-kit')} value={catNameFontSize} min={10} max={60} onChange={(v) => setAttributes({ catNameFontSize: parseInt(v) || 16 })} />
				</FlexItem>
				<FlexItem>
					<ColorRow label={__('Color', 'commerce-kit')} value={catNameColor} onChange={set('catNameColor')} />
				</FlexItem>
			</Flex>
			<SelectControl
				label={__('Font Weight', 'commerce-kit')}
				value={catNameFontWeight}
				options={[
					{ label: '400 – Normal',     value: '400' },
					{ label: '500 – Medium',     value: '500' },
					{ label: '600 – Semi Bold',  value: '600' },
					{ label: '700 – Bold',       value: '700' },
					{ label: '800 – Extra Bold', value: '800' },
				]}
				onChange={set('catNameFontWeight')}
			/>

			<div style={{ fontSize: '12px', color: '#757575', marginTop: 12, marginBottom: 6 }}>{__('Description', 'commerce-kit')}</div>
			<Flex>
				<FlexItem>
					<NumberControl label={__('Size (px)', 'commerce-kit')} value={descFontSize} min={10} max={40} onChange={(v) => setAttributes({ descFontSize: parseInt(v) || 14 })} />
				</FlexItem>
				<FlexItem>
					<ColorRow label={__('Color', 'commerce-kit')} value={descColor} onChange={set('descColor')} />
				</FlexItem>
			</Flex>

			<div style={{ fontSize: '12px', color: '#757575', marginTop: 12, marginBottom: 6 }}>{__('Product Count', 'commerce-kit')}</div>
			<Flex>
				<FlexItem>
					<NumberControl label={__('Size (px)', 'commerce-kit')} value={countFontSize} min={10} max={40} onChange={(v) => setAttributes({ countFontSize: parseInt(v) || 13 })} />
				</FlexItem>
				<FlexItem>
					<ColorRow label={__('Color', 'commerce-kit')} value={countColor} onChange={set('countColor')} />
				</FlexItem>
			</Flex>

		</PanelBody>
	);
};

export default DisplayPanel;
