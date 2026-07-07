import { useState, useEffect } from '@wordpress/element';
import {
	PanelBody, TextControl, ToggleControl, SelectControl,
	RangeControl, ButtonGroup, Button, CheckboxControl, Spinner,
	__experimentalNumberControl as NumberControl,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ResponsiveColumns from '../components/ResponsiveColumns';
import SubHeading       from '../components/SubHeading';

const LAYOUTS = [
	['carousel', __('Carousel', 'commerce-kit')],
	['slider',   __('Slider',   'commerce-kit')],
	['grid',     __('Grid',     'commerce-kit')],
	['inline',   __('Inline',   'commerce-kit')],
];

const CAROUSEL_STYLES = [
	['standard', __('Standard', 'commerce-kit')],
	['ticker',   __('Ticker',   'commerce-kit')],
	['fade',     __('Fade',     'commerce-kit')],
];

const LABEL_STYLE = { fontSize: '12px', fontWeight: 500, color: '#1e1e1e', marginBottom: 4 };
const HELP_STYLE  = { fontSize: 11, color: '#757575', margin: '0 0 8px' };

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
		layout, carouselStyle, categoryType,
		parentChildCategories, displayType,
		excludeParent, excludeChild, excludeGrandChild, excludeGreatGrandChild,
		spaceBetween, filterType, specificCategories,
		hideEmpty, hideCatWithoutThumb, totalCategories,
		orderBy, order, randomize, preloader,
	} = attributes;

	const set      = (key) => (val) => setAttributes({ [key]: val });
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
			<div style={{ marginBottom: 14 }}>
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
				<p style={{ ...HELP_STYLE, marginTop: 5 }}>
					{layout === 'carousel' && __('Multi-column Swiper carousel.', 'commerce-kit')}
					{layout === 'slider'   && __('Full-width single-column slider.', 'commerce-kit')}
					{layout === 'grid'     && __('Static responsive CSS grid — no slider.', 'commerce-kit')}
					{layout === 'inline'   && __('Horizontal scrollable row.', 'commerce-kit')}
				</p>
			</div>

			{/* ── Carousel Style (carousel layout only) */}
			{layout === 'carousel' && (
				<div style={{ marginBottom: 14 }}>
					<div style={LABEL_STYLE}>{__('Carousel Style', 'commerce-kit')}</div>
					<ButtonGroup>
						{CAROUSEL_STYLES.map(([val, label]) => (
							<Button
								key={val}
								variant={(carouselStyle || 'standard') === val ? 'primary' : 'secondary'}
								onClick={() => setAttributes({ carouselStyle: val })}
								size="small"
							>{label}</Button>
						))}
					</ButtonGroup>
					<p style={{ ...HELP_STYLE, marginTop: 5 }}>
						{(carouselStyle || 'standard') === 'standard' && __('Slides one step at a time with navigation and pagination.', 'commerce-kit')}
						{carouselStyle === 'ticker' && __('Continuous auto-scrolling — cards glide by non-stop, no snapping.', 'commerce-kit')}
						{carouselStyle === 'fade'   && __('Crossfades between one category at a time.', 'commerce-kit')}
					</p>
				</div>
			)}

			{/* ── Category Type */}
			<div style={{ marginBottom: 10 }}>
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
					<div style={{ marginBottom: 14 }}>
						<div style={LABEL_STYLE}>{__('Select Categories', 'commerce-kit')}</div>
						<p style={HELP_STYLE}>{__('Leave empty to show all.', 'commerce-kit')}</p>

						<div style={{ border: '1px solid #ddd', borderRadius: 4, background: '#fff', overflow: 'hidden', marginBottom: 6 }}>
							{/* Search */}
							<div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '0 10px', gap: 6 }}>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
									<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
								</svg>
								<input
									type="text"
									placeholder={__('Search categories…', 'commerce-kit')}
									value={catSearch}
									onChange={e => setCatSearch(e.target.value)}
									style={{
										flex: 1, padding: '7px 0', fontSize: 12,
										border: 'none', outline: 'none', background: 'transparent',
									}}
								/>
								{catSearch && (
									<button
										onClick={() => setCatSearch('')}
										style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0, lineHeight: 1, fontSize: 14 }}
									>×</button>
								)}
							</div>

							{/* Category list */}
							<div style={{ maxHeight: 190, overflowY: 'auto' }}>
								{catsLoading && (
									<div style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 12 }}>
										<Spinner /> {__('Loading…', 'commerce-kit')}
									</div>
								)}
								{!catsLoading && filteredCats.length === 0 && (
									<div style={{ padding: '10px 12px', fontSize: 12, color: '#999' }}>
										{__('No categories found.', 'commerce-kit')}
									</div>
								)}
								{!catsLoading && filteredCats.map(cat => {
									const isSelected = selectedIds.includes(cat.id);
									return (
										<label
											key={cat.id}
											style={{
												display: 'flex', alignItems: 'center', gap: 8,
												padding: '5px 10px',
												paddingLeft: (cat.depth * 16 + 10) + 'px',
												cursor: 'pointer',
												background: isSelected ? '#f0f5ff' : 'transparent',
												borderBottom: '1px solid #f5f5f5',
												transition: 'background 0.1s',
											}}
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleCat(cat.id)}
												style={{ flexShrink: 0, margin: 0, accentColor: '#cc2b5e' }}
											/>
											<span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
												{cat.depth > 0 && (
													<span style={{ color: '#ccc', fontSize: 10, flexShrink: 0 }}>›</span>
												)}
												<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
													{cat.name}
												</span>
												<span style={{ color: '#aaa', fontSize: 11, flexShrink: 0 }}>({cat.count})</span>
											</span>
										</label>
									);
								})}
							</div>
						</div>

						{/* Selected chips */}
						{selectedIds.length > 0 && (
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
								{selectedIds.map(id => {
									const cat = allCats.find(c => c.id === id);
									if (!cat) return null;
									return (
										<span
											key={id}
											style={{
												display: 'inline-flex', alignItems: 'center', gap: 4,
												padding: '2px 8px 2px 10px', fontSize: 11,
												background: '#eef2ff', color: '#4361ee',
												border: '1px solid #c7d2fe', borderRadius: 20,
											}}
										>
											{cat.name}
											<button
												onClick={() => toggleCat(id)}
												style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0, lineHeight: 1, fontSize: 13 }}
											>×</button>
										</span>
									);
								})}
								<button
									onClick={() => setAttributes({ parentChildCategories: '' })}
									style={{ fontSize: 11, color: '#cc2b5e', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
								>
									{__('Clear all', 'commerce-kit')}
								</button>
							</div>
						)}
					</div>

					{/* Display Type */}
					<div style={{ marginBottom: 14 }}>
						<div style={LABEL_STYLE}>{__('Display Type', 'commerce-kit')}</div>
						<p style={HELP_STYLE}>{__('How to display parent and child categories.', 'commerce-kit')}</p>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
							{[
								['individualize',      __('Individualize Each',  'commerce-kit'), __('Each as its own card', 'commerce-kit')],
								['child_under_parent', __('Child Under Parent',  'commerce-kit'), __('Children inside parent card', 'commerce-kit')],
							].map(([val, label, desc]) => (
								<button
									key={val}
									onClick={() => setAttributes({ displayType: val })}
									style={{
										padding: '8px 10px', textAlign: 'left', cursor: 'pointer',
										border: displayType === val ? '2px solid #cc2b5e' : '2px solid #e0e0e0',
										borderRadius: 4, background: displayType === val ? '#fff5f7' : '#fff',
										transition: 'border-color 0.15s, background 0.15s',
									}}
								>
									<div style={{ fontSize: 12, fontWeight: 600, color: displayType === val ? '#cc2b5e' : '#333', marginBottom: 2 }}>{label}</div>
									<div style={{ fontSize: 10, color: '#888', lineHeight: 1.3 }}>{desc}</div>
								</button>
							))}
						</div>
					</div>

					{/* Exclude Levels */}
					<div style={{ marginBottom: 10 }}>
						<div style={LABEL_STYLE}>{__('Exclude Level(s)', 'commerce-kit')}</div>
						<p style={HELP_STYLE}>{__('Exclude categories by depth level.', 'commerce-kit')}</p>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 0' }}>
							<CheckboxControl label={__('Parent',            'commerce-kit')} checked={excludeParent}          onChange={set('excludeParent')} />
							<CheckboxControl label={__('Child',             'commerce-kit')} checked={excludeChild}           onChange={set('excludeChild')} />
							<CheckboxControl label={__('Grand Child',       'commerce-kit')} checked={excludeGrandChild}      onChange={set('excludeGrandChild')} />
							<CheckboxControl label={__('Great-grand Child', 'commerce-kit')} checked={excludeGreatGrandChild} onChange={set('excludeGreatGrandChild')} />
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

			{/* ── Filter & Order */}
			<SubHeading>{__('Filter & Order', 'commerce-kit')}</SubHeading>

			{/* Filter (only in parent mode or individualize) */}
			{(!isAllMode || displayType === 'individualize') && (
				<>
					<SelectControl
						label={__('Filter Categories', 'commerce-kit')}
						value={filterType}
						options={[
							{ label: __('Show All',            'commerce-kit'), value: 'all' },
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

			<ToggleControl label={__('Randomize Order',                   'commerce-kit')} checked={randomize}          onChange={set('randomize')} />
			<ToggleControl label={__('Hide Empty Categories',             'commerce-kit')} checked={hideEmpty}           onChange={set('hideEmpty')} />
			<ToggleControl label={__('Hide Categories Without Thumbnail', 'commerce-kit')} checked={hideCatWithoutThumb} onChange={set('hideCatWithoutThumb')} />

			<Divider />

			<ToggleControl
				label={__('Preloader', 'commerce-kit')}
				help={__('Slider will be hidden until page load is completed.', 'commerce-kit')}
				checked={preloader !== false}
				onChange={set('preloader')}
			/>

		</PanelBody>
	);
};

export default GeneralPanel;
