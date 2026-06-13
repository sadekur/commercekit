import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useState, useEffect, useRef }      from '@wordpress/element';
import GeneralPanel   from './panels/GeneralPanel';
import DisplayPanel   from './panels/DisplayPanel';
import ThumbnailPanel from './panels/ThumbnailPanel';
import SliderPanel    from './panels/SliderPanel';
import Preview        from './Preview';

const Edit = ({ attributes, setAttributes }) => {
	const blockProps = useBlockProps({ className: 'ck-csl-editor-wrap' });

	const {
		layout, categoryType,
		totalCategories, orderBy, order, hideEmpty,
		filterType, specificCategories, hideCatWithoutThumb, randomize,
	} = attributes;

	const isSliderLayout = layout === 'carousel' || layout === 'slider';

	// ── Live category fetch
	const [categories, setCategories] = useState([]);
	const [isLoading,  setIsLoading]  = useState(true);
	const [fetchError, setFetchError] = useState(false);
	const abortRef = useRef(null);

	useEffect(() => {
		if (abortRef.current) abortRef.current = false;
		const alive = { current: true };
		abortRef.current = alive;

		setIsLoading(true);
		setFetchError(false);

		const orderByMap = { term_id: 'id', name: 'name', id: 'id', count: 'count', description: 'description' };
		const params = new URLSearchParams({
			per_page:   Math.min(Math.max(1, totalCategories), 100),
			orderby:    orderByMap[orderBy] || 'name',
			order:      (order || 'ASC').toLowerCase(),
			hide_empty: hideEmpty ? 'true' : 'false',
		});

		if (categoryType === 'parent') {
			params.set('parent', '0');
		}

		if (filterType === 'specific' && specificCategories) {
			const ids = specificCategories.split(',').map(s => s.trim()).filter(Boolean).join(',');
			if (ids) params.set('include', ids);
		}

		window.wp.apiFetch({ path: `/wc/v3/products/categories?${params}` })
			.then(data => {
				if (!alive.current) return;
				let result = Array.isArray(data) ? data : [];
				if (hideCatWithoutThumb) result = result.filter(c => c.image && c.image.src);
				if (randomize) result.sort(() => Math.random() - 0.5);
				setCategories(result);
				setIsLoading(false);
			})
			.catch(() => {
				if (!alive.current) return;
				setFetchError(true);
				setIsLoading(false);
			});

		return () => { alive.current = false; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totalCategories, orderBy, order, hideEmpty, filterType, specificCategories, hideCatWithoutThumb, randomize, categoryType]);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<GeneralPanel   attributes={attributes} setAttributes={setAttributes} />
				<DisplayPanel   attributes={attributes} setAttributes={setAttributes} />
				<ThumbnailPanel attributes={attributes} setAttributes={setAttributes} />
				<SliderPanel    attributes={attributes} setAttributes={setAttributes} />
			</InspectorControls>

			<Preview
				attributes={attributes}
				categories={categories}
				isLoading={isLoading}
				fetchError={fetchError}
			/>
		</div>
	);
};

export default Edit;
