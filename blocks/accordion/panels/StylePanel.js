import { Panel, PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ColorControl from '../components/ColorControl';

const FONT_OPTIONS = [
	{ label: 'Default', value: 'inherit' },
	{ label: 'Arial',   value: 'Arial, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Roboto',  value: "'Roboto', sans-serif" },
];

const BORDER_STYLE_OPTIONS = [
	{ label: __('Solid',  'commerce-kit'), value: 'solid' },
	{ label: __('Dashed', 'commerce-kit'), value: 'dashed' },
	{ label: __('Dotted', 'commerce-kit'), value: 'dotted' },
	{ label: __('Double', 'commerce-kit'), value: 'double' },
	{ label: __('None',   'commerce-kit'), value: 'none' },
];

const StylePanel = ({ attributes, setAttributes }) => {
	const {
		borderColor, borderSize, borderStyle,
		titleColor, titleFontSize, titleFontFamily,
		contentColor, contentFontSize, contentFontFamily,
		buttonBackgroundColor, buttonTextColor, buttonFontSize, buttonFontFamily, buttonText,
	} = attributes;
	const set = (key) => (val) => setAttributes({ [key]: val });

	return (
		<Panel>
			<PanelBody title={__('Accordion Settings', 'commerce-kit')} initialOpen={true}>

				{/* ── Border */}
				<ColorControl label={__('Border Color', 'commerce-kit')} value={borderColor} onChange={set('borderColor')} />
				<TextControl
					label={__('Border Size (px)', 'commerce-kit')}
					value={parseInt(borderSize, 10)}
					type="number"
					onChange={(v) => setAttributes({ borderSize: `${v}px` })}
				/>
				<SelectControl
					label={__('Border Style', 'commerce-kit')}
					value={borderStyle}
					options={BORDER_STYLE_OPTIONS}
					onChange={set('borderStyle')}
				/>

				{/* ── Title */}
				<ColorControl label={__('Title Color', 'commerce-kit')} value={titleColor} onChange={set('titleColor')} />
				<TextControl
					label={__('Title Font Size (px)', 'commerce-kit')}
					value={parseInt(titleFontSize, 10)}
					type="number"
					onChange={(v) => setAttributes({ titleFontSize: `${v}px` })}
				/>
				<SelectControl
					label={__('Title Font Family', 'commerce-kit')}
					value={titleFontFamily}
					options={FONT_OPTIONS}
					onChange={set('titleFontFamily')}
				/>

				{/* ── Content */}
				<ColorControl label={__('Content Color', 'commerce-kit')} value={contentColor} onChange={set('contentColor')} />
				<TextControl
					label={__('Content Font Size (px)', 'commerce-kit')}
					value={parseInt(contentFontSize, 10)}
					type="number"
					onChange={(v) => setAttributes({ contentFontSize: `${v}px` })}
				/>
				<SelectControl
					label={__('Content Font Family', 'commerce-kit')}
					value={contentFontFamily}
					options={FONT_OPTIONS}
					onChange={set('contentFontFamily')}
				/>

				{/* ── Button */}
				<ColorControl label={__('Button Background Color', 'commerce-kit')} value={buttonBackgroundColor} onChange={set('buttonBackgroundColor')} />
				<ColorControl label={__('Button Text Color', 'commerce-kit')}       value={buttonTextColor}       onChange={set('buttonTextColor')} />
				<TextControl
					label={__('Button Font Size (px)', 'commerce-kit')}
					value={parseInt(buttonFontSize, 10)}
					type="number"
					onChange={(v) => setAttributes({ buttonFontSize: `${v}px` })}
				/>
				<SelectControl
					label={__('Button Font Family', 'commerce-kit')}
					value={buttonFontFamily}
					options={FONT_OPTIONS}
					onChange={set('buttonFontFamily')}
				/>
				<TextControl
					label={__('Button Text', 'commerce-kit')}
					value={buttonText}
					onChange={set('buttonText')}
				/>

			</PanelBody>
		</Panel>
	);
};

export default StylePanel;
