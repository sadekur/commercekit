import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BREAKPOINTS = [
	['colLarge',   '≥1280', 'Large'],
	['colDesktop', '≥1024', 'Desktop'],
	['colLaptop',  '≥768',  'Laptop'],
	['colTablet',  '≥480',  'Tablet'],
	['colMobile',  '<480',  'Mobile'],
];

const ResponsiveColumns = ({ attributes, setAttributes }) => (
	<div style={{
		background: '#f9f9f9',
		border: '1px solid #e8e8e8',
		borderRadius: 4,
		padding: '10px 12px',
		marginBottom: 4,
	}}>
		<div style={{ fontSize: '11px', fontWeight: 600, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
			{__('Columns per Breakpoint', 'commerce-kit')}
		</div>
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
			{BREAKPOINTS.map(([key, bp, label]) => (
				<div key={key} style={{ textAlign: 'center' }}>
					<div style={{ fontSize: '10px', color: '#888', marginBottom: 3, lineHeight: 1.2 }}>{bp}</div>
					<NumberControl
						value={attributes[key]}
						min={1}
						max={10}
						onChange={(v) => setAttributes({ [key]: Math.max(1, parseInt(v) || 1) })}
						style={{ width: '100%', minWidth: 0 }}
						title={__(label, 'commerce-kit')}
					/>
				</div>
			))}
		</div>
	</div>
);

export default ResponsiveColumns;
