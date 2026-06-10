import {
	PanelBody, TextControl, ToggleControl, SelectControl,
	RangeControl, ButtonGroup, Button,
	__experimentalNumberControl as NumberControl,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ResponsiveColumns from '../components/ResponsiveColumns';

const GeneralPanel = ({ attributes, setAttributes }) => {
	const {
		layout, spaceBetween,
		filterType, specificCategories,
		hideEmpty, hideCatWithoutThumb, totalCategories,
		orderBy, order, randomize,
	} = attributes;
	const set = (key) => (val) => setAttributes({ [key]: val });

	return (
		<PanelBody title={__('General Settings', 'commerce-kit')} initialOpen={true}>

			<div style={{ marginBottom: 12 }}>
				<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 6 }}>{__('Layout', 'commerce-kit')}</div>
				<ButtonGroup>
					{[
						['carousel', __('Carousel', 'commerce-kit')],
						['slider',   __('Slider (1-col)', 'commerce-kit')],
					].map(([val, label]) => (
						<Button
							key={val}
							variant={layout === val ? 'primary' : 'secondary'}
							onClick={() => setAttributes({ layout: val })}
							size="small"
						>
							{label}
						</Button>
					))}
				</ButtonGroup>
			</div>

			{'carousel' === layout && (
				<ResponsiveColumns attributes={attributes} setAttributes={setAttributes} />
			)}

			<div style={{ marginTop: 12 }}>
				<RangeControl
					label={__('Space Between Categories (px)', 'commerce-kit')}
					value={spaceBetween}
					onChange={set('spaceBetween')}
					min={0}
					max={100}
				/>
			</div>

			<Divider />

			<SelectControl
				label={__('Filter Categories', 'commerce-kit')}
				value={filterType}
				options={[
					{ label: __('Show All', 'commerce-kit'),              value: 'all' },
					{ label: __('Specific Categories', 'commerce-kit'),   value: 'specific' },
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
				min={1}
				max={200}
				onChange={(v) => setAttributes({ totalCategories: Math.max(1, parseInt(v) || 12) })}
			/>

			<SelectControl
				label={__('Order By', 'commerce-kit')}
				value={orderBy}
				options={[
					{ label: __('Name', 'commerce-kit'),        value: 'name' },
					{ label: __('ID', 'commerce-kit'),          value: 'id' },
					{ label: __('Count', 'commerce-kit'),       value: 'count' },
					{ label: __('Date Added', 'commerce-kit'),  value: 'term_id' },
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

			<ToggleControl label={__('Randomize Order', 'commerce-kit')}                        checked={randomize}          onChange={set('randomize')} />
			<ToggleControl label={__('Hide Empty Categories', 'commerce-kit')}                  checked={hideEmpty}           onChange={set('hideEmpty')} />
			<ToggleControl label={__('Hide Categories Without Thumbnail', 'commerce-kit')}      checked={hideCatWithoutThumb} onChange={set('hideCatWithoutThumb')} />

		</PanelBody>
	);
};

export default GeneralPanel;
