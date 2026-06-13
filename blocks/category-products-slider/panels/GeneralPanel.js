import { useState, useEffect } from '@wordpress/element';
import {
	PanelBody, TextControl, ToggleControl, SelectControl,
	RangeControl, ButtonGroup, Button, CheckboxControl, Spinner,
	__experimentalNumberControl as NumberControl,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ResponsiveColumns from '../components/ResponsiveColumns';

const LAYOUTS = [
	['carousel', __('Carousel', 'commerce-kit')],
	['slider',   __('Slider',   'commerce-kit')],
	['grid',     __('Grid',     'commerce-kit')],
	['inline',   __('Inline',   'commerce-kit')],
];

const LABEL_STYLE  = { fontSize: '12px', fontWeight: 500, color: '#1e1e1e', marginBottom: 4 };
const HELP_STYLE   = { fontSize: 11, color: '#757575', margin: '0 0 8px' };

// Build a depth-sorted flat list from a flat category array (WC REST format)
function buildHierarchyTree(cats) {
	const sorted = [];
	const add = (parentId, depth) => {
		cats
			.filter(c => c.parent === parentId)
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach(c => { sorted.push({ ...c, depth }); add(c.id, depth + 1); });
	};
	add(0, 0);
	return sorted;
}

const GeneralPanel = ({ attributes, setAttributes }) => {
	const {
		layout, categoryType,
		parentChildCategories, displayType,
		excludeParent, excludeChild, excludeGrandChild, excludeGreatGrandChild,
		spaceBetween, filterType, specificCategories,
		hideEmpty, hideCatWithoutThumb, totalCategories,
		orderBy, order, randomize,
	} = attributes;

	const set = (key) => (val) => setAttributes({ [key]: val });
	const isSlider  = layout === 'carousel' || layout === 'slider';
	const isAllMode = categoryType === 'all';

	// ── Hierarchical category tree for the selector
	const [allCats,     setAllCats]     = useState([]);
	const [catsLoading, setCatsLoading] = useState(false);
	const [catSearch,   setCatSearch]   = useState('');

	useEffect(() => {
		if (!isAllMode) return;
		setCatsLoading(true);
		window.wp.apiFetch({ path: '/wc/v3/products/categories?per_page=100&orderby=name&order=asc' })
			.then(data => {
				setAllCats(buildHierarchyTree(Array.isArray(data) ? data : []));
				setCatsLoading(false);
			})
			.catch(() => setCatsLoading(false));
	}, [isAllMode]);

	// Selected IDs (comma-sep string → number array)
	const selectedIds = (parentChildCategories || '')
		.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);

	const toggleCat = (id) => {
		const next = selectedIds.includes(id)
			? selectedIds.filter(s => s !== id)
			: [...selectedIds, id];
		setAttributes({ parentChildCategories: next.join(',') });
	};

	const filteredCats = catSearch
		? allCats.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
		: allCats;

	return (
		<PanelBody title={__('General Settings', 'commerce-kit')} initialOpen={true}>

			{/* ── Layout Preset */}
			<div style={{ marginBottom: 12 }}>
				<div style={LABEL_STYLE}>{__('Layout Preset', 'commerce-kit')}</div>
				<ButtonGroup>
					{LAYOUTS.map(([val, label]) => (
						<Button
							key={val}
							variant={layout === val ? 'primary' : 'secondary'}
							onClick={() => setAttributes({ layout: val })}
							size="small"
						>{label}</Button>
					))}
				</ButtonGroup>
				<p style={{ ...HELP_STYLE, marginTop: 4 }}>
					{layout === 'carousel' && __('Multi-column Swiper carousel.', 'commerce-kit')}
					{layout === 'slider'   && __('Full-width single-column slider.', 'commerce-kit')}
					{layout === 'grid'     && __('Static responsive CSS grid — no slider.', 'commerce-kit')}
					{layout === 'inline'   && __('Horizontal scrollable row.', 'commerce-kit')}
				</p>
			</div>

			{/* ── Category Type */}
			<div style={{ marginBottom: 8 }}>
				<div style={LABEL_STYLE}>{__('Category Type', 'commerce-kit')}</div>
				<p style={HELP_STYLE}>{__('Select a category type.', 'commerce-kit')}</p>
				<ButtonGroup>
					{[
						['parent', __('Parent', 'commerce-kit')],
						['all',    __('Parent and Child', 'commerce-kit')],
					].map(([val, label]) => (
						<Button
							key={val}
							variant={categoryType === val ? 'primary' : 'secondary'}
							onClick={() => setAttributes({ categoryType: val })}
							size="small"
						>{label}</Button>
					))}
				</ButtonGroup>
			</div>

			{/* ── Parent and Child options (only when 'all') */}
			{isAllMode && (
				<>
					<Divider />

					{/* Category selector */}
					<div style={{ marginBottom: 12 }}>
						<div style={LABEL_STYLE}>{__('Parent and Child', 'commerce-kit')}</div>
						<p style={HELP_STYLE}>{__('Select category(s). Leave empty to show all.', 'commerce-kit')}</p>

						<div style={{ border: '1px solid #ddd', borderRadius: 3, background: '#fff', marginBottom: 4 }}>
							{/* Search input */}
							<input
								type="text"
								placeholder={__('Select Category(s)', 'commerce-kit')}
								value={catSearch}
								onChange={e => setCatSearch(e.target.value)}
								style={{
									width: '100%', boxSizing: 'border-box',
									padding: '6px 10px', fontSize: 12,
									border: 'none', borderBottom: '1px solid #eee', outline: 'none',
								}}
							/>

							{/* Category list */}
							<div style={{ maxHeight: 180, overflowY: 'auto' }}>
								{catsLoading && (
									<div style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 12 }}>
										<Spinner /> {__('Loading…', 'commerce-kit')}
									</div>
								)}
								{!catsLoading && filteredCats.length === 0 && (
									<div style={{ padding: '8px 10px', fontSize: 12, color: '#999' }}>
										{__('No categories found.', 'commerce-kit')}
									</div>
								)}
								{!catsLoading && filteredCats.map(cat => {
									const isSelected = selectedIds.includes(cat.id);
									return (
										<label
											key={cat.id}
											style={{
												display: 'flex', alignItems: 'center',
												padding: '4px 10px', cursor: 'pointer', gap: 6,
												background: isSelected ? '#f0f5ff' : 'transparent',
												borderBottom: '1px solid #f5f5f5',
											}}
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleCat(cat.id)}
												style={{ flexShrink: 0, margin: 0 }}
											/>
											<span style={{ fontSize: 12, paddingLeft: cat.depth * 14 }}>
												{'–'.repeat(cat.depth)}{cat.depth > 0 ? '' : ''}{cat.name}
												{' '}
												<span style={{ color: '#999' }}>({cat.count})</span>
											</span>
										</label>
									);
								})}
							</div>
						</div>

						{selectedIds.length > 0 && (
							<button
								onClick={() => setAttributes({ parentChildCategories: '' })}
								style={{ fontSize: 11, color: '#cc2b5e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
							>
								{__('Clear selection', 'commerce-kit')}
							</button>
						)}
					</div>

					{/* Display Type */}
					<div style={{ marginBottom: 12 }}>
						<div style={LABEL_STYLE}>{__('Display Type', 'commerce-kit')}</div>
						<p style={HELP_STYLE}>{__('Select display type for parent and child categories.', 'commerce-kit')}</p>
						<ButtonGroup>
							{[
								['individualize',      __('Individualize Each',  'commerce-kit')],
								['child_under_parent', __('Child Under Parent',  'commerce-kit')],
							].map(([val, label]) => (
								<Button
									key={val}
									variant={displayType === val ? 'primary' : 'secondary'}
									onClick={() => setAttributes({ displayType: val })}
									size="small"
								>{label}</Button>
							))}
						</ButtonGroup>
						<p style={{ ...HELP_STYLE, marginTop: 4 }}>
							{displayType === 'individualize'
								? __('Each category shown as an individual card.', 'commerce-kit')
								: __('Children listed under their parent card.', 'commerce-kit')}
						</p>
					</div>

					{/* Exclude Levels */}
					<div style={{ marginBottom: 8 }}>
						<div style={LABEL_STYLE}>{__('Exclude Level(s)', 'commerce-kit')}</div>
						<p style={HELP_STYLE}>{__('Exclude different levels of categories.', 'commerce-kit')}</p>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
							<CheckboxControl label={__('Parent',           'commerce-kit')} checked={excludeParent}          onChange={set('excludeParent')} />
							<CheckboxControl label={__('Child',            'commerce-kit')} checked={excludeChild}           onChange={set('excludeChild')} />
							<CheckboxControl label={__('Grand Child',      'commerce-kit')} checked={excludeGrandChild}      onChange={set('excludeGrandChild')} />
							<CheckboxControl label={__('Great-grand Child','commerce-kit')} checked={excludeGreatGrandChild} onChange={set('excludeGreatGrandChild')} />
						</div>
					</div>

					<Divider />
				</>
			)}

			{/* ── Responsive columns (carousel only) */}
			{layout === 'carousel' && (
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

			{/* Filter / order (only in parent mode or individualize) */}
			{(!isAllMode || displayType === 'individualize') && (
				<>
					<SelectControl
						label={__('Filter Categories', 'commerce-kit')}
						value={filterType}
						options={[
							{ label: __('Show All',             'commerce-kit'), value: 'all' },
							{ label: __('Specific Categories',  'commerce-kit'), value: 'specific' },
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
				</>
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
					{ label: __('Name',        'commerce-kit'), value: 'name' },
					{ label: __('ID',          'commerce-kit'), value: 'id' },
					{ label: __('Count',       'commerce-kit'), value: 'count' },
					{ label: __('Date Added',  'commerce-kit'), value: 'term_id' },
					{ label: __('Description', 'commerce-kit'), value: 'description' },
				]}
				onChange={set('orderBy')}
			/>

			<SelectControl
				label={__('Order', 'commerce-kit')}
				value={order}
				options={[
					{ label: __('Ascending (A→Z)',  'commerce-kit'), value: 'ASC' },
					{ label: __('Descending (Z→A)', 'commerce-kit'), value: 'DESC' },
				]}
				onChange={set('order')}
			/>

			<ToggleControl label={__('Randomize Order',                         'commerce-kit')} checked={randomize}           onChange={set('randomize')} />
			<ToggleControl label={__('Hide Empty Categories',                   'commerce-kit')} checked={hideEmpty}            onChange={set('hideEmpty')} />
			<ToggleControl label={__('Hide Categories Without Thumbnail',       'commerce-kit')} checked={hideCatWithoutThumb}  onChange={set('hideCatWithoutThumb')} />

		</PanelBody>
	);
};

export default GeneralPanel;
