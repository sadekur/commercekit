import {
	PanelBody, SelectControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const PaginationPanel = ({ attributes, setAttributes }) => {
	const { gridPaginationType, gridItemsPerPage } = attributes;
	const set = (key) => (val) => setAttributes({ [key]: val });

	return (
		<PanelBody title={__('Pagination', 'commerce-kit')} initialOpen={false}>

			<SelectControl
				label={__('Pagination', 'commerce-kit')}
				value={gridPaginationType}
				options={[
					{ label: __('None — show all categories at once', 'commerce-kit'), value: 'none' },
					{ label: __('Load More button', 'commerce-kit'),                    value: 'load-more' },
					{ label: __('Numbered pagination', 'commerce-kit'),                 value: 'numbered' },
				]}
				onChange={set('gridPaginationType')}
				help={__('Additional pages are fetched from the server as needed.', 'commerce-kit')}
			/>

			{gridPaginationType !== 'none' && (
				<NumberControl
					label={__('Items Per Page', 'commerce-kit')}
					value={gridItemsPerPage}
					min={1} max={48}
					onChange={(v) => setAttributes({ gridItemsPerPage: parseInt(v) || 6 })}
				/>
			)}

		</PanelBody>
	);
};

export default PaginationPanel;
